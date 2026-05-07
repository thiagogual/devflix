/**
 * Scheduler Service - Serviço centralizado para gerenciamento de agendamentos
 *
 * CORREÇÃO: Agora lê dados frescos do Firebase antes de escrever,
 * evitando race conditions que sobrescreviam materiais salvos pelo admin.
 */

import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import eventBus, { MATERIAL_EVENTS } from './eventBus';
import cacheService from './cacheService';

class SchedulerService {
  constructor() {
    this.isChecking = false;
    this.checkInterval = null;
    this.CHECK_INTERVAL = 15000; // 15 segundos
    this.lastCheckTime = null;
    this.errorCount = 0;
    this.maxErrors = 3;
  }

  start() {
    if (this.checkInterval) {
      console.log('[SchedulerService] Already running');
      return;
    }

    console.log('[SchedulerService] Starting scheduler service');
    this.checkScheduledItems();
    this.checkInterval = setInterval(() => {
      this.checkScheduledItems();
    }, this.CHECK_INTERVAL);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[SchedulerService] Stopped');
    }
  }

  async checkScheduledItems() {
    if (this.isChecking) {
      return;
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const results = await this.processAllScheduledItems();
      const duration = Date.now() - startTime;
      console.log(`[SchedulerService] Check completed in ${duration}ms`, results);

      this.errorCount = 0;
      this.lastCheckTime = new Date();

      if (results.itemsActivated > 0) {
        eventBus.emit(MATERIAL_EVENTS.SCHEDULE_CHECK_COMPLETED, {
          hasChanges: true,
          itemsActivated: results.itemsActivated,
          types: results.activatedTypes
        });
      }

      return results;
    } catch (error) {
      console.error('[SchedulerService] Error checking scheduled items:', error);
      this.errorCount++;

      if (this.errorCount >= this.maxErrors) {
        console.error('[SchedulerService] Too many errors, pausing service for 1 minute');
        this.stop();
        setTimeout(() => {
          this.errorCount = 0;
          this.start();
        }, 60000);
      }

      throw error;
    } finally {
      this.isChecking = false;
    }
  }

  async processAllScheduledItems() {
    const now = new Date();
    const results = {
      itemsActivated: 0,
      activatedTypes: [],
      processedInstances: 0,
      errors: []
    };

    try {
      const devflixCollection = collection(db, 'devflix-instances');
      const snapshot = await getDocs(devflixCollection);

      if (snapshot.empty) {
        return results;
      }

      const instances = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      for (const instance of instances) {
        try {
          const instanceResults = await this.processInstance(instance, now);

          if (instanceResults.hasChanges) {
            results.itemsActivated += instanceResults.itemsActivated;
            results.activatedTypes = [...new Set([...results.activatedTypes, ...instanceResults.types])];

            cacheService.invalidate(`devflix-${instance.path}`);

            eventBus.emit(MATERIAL_EVENTS.MATERIALS_SYNCED, {
              path: instance.path,
              itemsActivated: instanceResults.itemsActivated
            });
          }

          results.processedInstances++;
        } catch (error) {
          console.error(`[SchedulerService] Error processing instance ${instance.id}:`, error);
          results.errors.push({
            instanceId: instance.id,
            error: error.message
          });
        }
      }
    } catch (error) {
      console.error('[SchedulerService] Fatal error in processAllScheduledItems:', error);
      throw error;
    }

    return results;
  }

  /**
   * Processa uma instância - primeiro identifica O QUE precisa mudar,
   * depois relê os dados frescos do Firebase e aplica SÓ as mudanças necessárias.
   */
  async processInstance(instance, now) {
    const results = {
      hasChanges: false,
      itemsActivated: 0,
      types: []
    };

    // 1. Verificar se o banner precisa ser ativado
    const needsBannerActivation = this.shouldActivateBanner(instance, now);

    // 2. Identificar quais materiais precisam ser desbloqueados (por ID)
    const materialsToUnlock = this.findMaterialsToUnlock(instance, now);

    // 3. Verificar quais links precisam ser ativados (por ID)
    const linksToActivate = this.findLinksToActivate(instance, now);

    const hasAnythingToUpdate = needsBannerActivation || materialsToUnlock.length > 0 || linksToActivate.length > 0;

    if (!hasAnythingToUpdate) {
      return results;
    }

    // CORREÇÃO: Reler dados frescos do Firebase antes de escrever
    const freshInstance = await this.getFreshInstance(instance.id);
    if (!freshInstance) {
      console.warn(`[SchedulerService] Instance ${instance.id} not found on re-read, skipping`);
      return results;
    }

    const updates = {};

    // Aplicar ativação do banner nos dados frescos
    if (needsBannerActivation && this.shouldActivateBanner(freshInstance, now)) {
      updates.bannerEnabled = true;
      updates.banner = {
        ...freshInstance.banner,
        scheduledVisibility: null
      };
      results.itemsActivated++;
      results.types.push('banner');
      results.hasChanges = true;
      console.log(`[SchedulerService] Activating banner for: ${freshInstance.name}`);
    }

    // Aplicar desbloqueio de materiais nos dados frescos (só os itens específicos)
    if (materialsToUnlock.length > 0 && freshInstance.materials) {
      const updatedMaterials = this.applyMaterialUnlocks(freshInstance.materials, materialsToUnlock, now);
      if (updatedMaterials) {
        updates.materials = updatedMaterials.materials;
        results.itemsActivated += updatedMaterials.count;
        results.types.push('material');
        results.hasChanges = true;
      }
    }

    // Aplicar ativação de links nos dados frescos (só os itens específicos)
    if (linksToActivate.length > 0 && freshInstance.headerLinks) {
      const updatedLinks = this.applyLinkActivations(freshInstance.headerLinks, linksToActivate, now);
      if (updatedLinks) {
        updates.headerLinks = updatedLinks.links;
        results.itemsActivated += updatedLinks.count;
        results.types.push('link');
        results.hasChanges = true;
      }
    }

    if (results.hasChanges) {
      await this.updateInstance(instance.id, updates);
    }

    return results;
  }

  /**
   * Relê a instância direto do Firebase para ter dados frescos
   */
  async getFreshInstance(instanceId) {
    try {
      const docRef = doc(db, 'devflix-instances', instanceId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(`[SchedulerService] Error re-reading instance ${instanceId}:`, error);
      return null;
    }
  }

  /**
   * Identifica quais materiais precisam ser desbloqueados (retorna lista de IDs)
   */
  findMaterialsToUnlock(instance, now) {
    const toUnlock = [];

    if (!instance.materials || instance.materials.length === 0) {
      return toUnlock;
    }

    for (const classMaterials of instance.materials) {
      if (!classMaterials?.items || classMaterials.items.length === 0) {
        continue;
      }

      for (const item of classMaterials.items) {
        if (this.shouldUnlockMaterial(item, now)) {
          toUnlock.push(item.id);
        }
        // Se já foi desbloqueado mas está trancado de novo (bug de re-lock)
        if (item.unlockedAt && item.locked) {
          toUnlock.push(item.id);
        }
      }
    }

    return toUnlock;
  }

  /**
   * Aplica desbloqueio APENAS nos materiais identificados, usando dados frescos
   */
  applyMaterialUnlocks(freshMaterials, materialIds, now) {
    let count = 0;
    const materials = freshMaterials.map(classMaterials => {
      if (!classMaterials?.items || classMaterials.items.length === 0) {
        return classMaterials;
      }

      const updatedItems = classMaterials.items.map(item => {
        if (materialIds.includes(item.id) && item.locked) {
          console.log(`[SchedulerService] Unlocking material: ${item.title}`);
          count++;
          return {
            ...item,
            locked: false,
            scheduledUnlock: null,
            unlockedAt: now.toISOString()
          };
        }
        return item;
      });

      return { ...classMaterials, items: updatedItems };
    });

    if (count === 0) return null;
    return { materials, count };
  }

  /**
   * Identifica quais links precisam ser ativados (retorna lista de IDs)
   */
  findLinksToActivate(instance, now) {
    const toActivate = [];

    if (!instance.headerLinks || instance.headerLinks.length === 0) {
      return toActivate;
    }

    for (const link of instance.headerLinks) {
      if (this.shouldActivateLink(link, now)) {
        toActivate.push(link.id);
      }
    }

    return toActivate;
  }

  /**
   * Aplica ativação APENAS nos links identificados, usando dados frescos
   */
  applyLinkActivations(freshLinks, linkIds, now) {
    let count = 0;
    const links = freshLinks.map(link => {
      if (linkIds.includes(link.id) && !link.visible) {
        console.log(`[SchedulerService] Activating link: ${link.title}`);
        count++;
        return {
          ...link,
          visible: true,
          scheduledVisibility: null,
          activatedAt: now.toISOString()
        };
      }
      return link;
    });

    if (count === 0) return null;
    return { links, count };
  }

  shouldActivateBanner(instance, now) {
    if (instance.bannerEnabled || !instance.banner?.scheduledVisibility) {
      return false;
    }

    const visibilityTime = this.parseTimestamp(instance.banner.scheduledVisibility);
    if (!visibilityTime) return false;

    return visibilityTime <= now;
  }

  parseTimestamp(timestamp) {
    if (!timestamp) return null;

    // Firestore Timestamp com seconds
    if (timestamp.seconds !== undefined) {
      return new Date(timestamp.seconds * 1000);
    }

    // Firestore Timestamp com toDate()
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }

    // String ISO ou número
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      console.warn('[SchedulerService] Invalid timestamp:', timestamp);
      return null;
    }

    return date;
  }

  shouldUnlockMaterial(item, now) {
    if (!item.locked) return false;
    if (item.unlockedAt) return false;
    if (!item.scheduledUnlock) return false;

    const unlockTime = this.parseTimestamp(item.scheduledUnlock);
    if (!unlockTime) return false;

    return unlockTime <= now;
  }

  shouldActivateLink(link, now) {
    if (link.visible || !link.scheduledVisibility) {
      return false;
    }

    const visibilityTime = this.parseTimestamp(link.scheduledVisibility);
    if (!visibilityTime) return false;

    return visibilityTime <= now;
  }

  async updateInstance(instanceId, updates) {
    try {
      const instanceRef = doc(db, 'devflix-instances', instanceId);
      await updateDoc(instanceRef, {
        ...updates,
        lastSchedulerUpdate: Timestamp.now()
      });
      console.log(`[SchedulerService] Instance ${instanceId} updated successfully`);
    } catch (error) {
      console.error(`[SchedulerService] Error updating instance ${instanceId}:`, error);
      throw error;
    }
  }

  async forceCheck() {
    console.log('[SchedulerService] Force check requested');
    return await this.checkScheduledItems();
  }

  getStatus() {
    return {
      isRunning: !!this.checkInterval,
      isChecking: this.isChecking,
      lastCheckTime: this.lastCheckTime,
      errorCount: this.errorCount,
      checkInterval: this.CHECK_INTERVAL
    };
  }
}

const schedulerService = new SchedulerService();
export default schedulerService;
export const checkAndActivateScheduledItems = () => schedulerService.checkScheduledItems();
