// src/components/MaterialsUnlockChecker.jsx
import { useEffect, useRef, useCallback } from 'react';
import { useDevflix } from '../contexts/DevflixContext';
import eventBus, { MATERIAL_EVENTS } from '../services/eventBus';
import cacheService from '../services/cacheService';

const MaterialsUnlockChecker = () => {
  const { materials, currentDevflix, path } = useDevflix();
  const lastCheckRef = useRef(null);
  const lastUnlockStateRef = useRef(new Map());
  const reloadAttempts = useRef(0);
  const MAX_RELOAD_ATTEMPTS = 3;
  
  // Função para comparar estados de desbloqueio
  const getMaterialsState = useCallback((materials) => {
    const state = new Map();
    materials?.forEach(classM => {
      classM.items?.forEach(item => {
        if (item.id) {
          state.set(item.id, {
            locked: item.locked,
            scheduledUnlock: item.scheduledUnlock
          });
        }
      });
    });
    return state;
  }, []);
  
  // Função para verificar mudanças reais no estado
  const hasStateChanged = useCallback((currentState, previousState) => {
    if (currentState.size !== previousState.size) return true;
    
    for (const [id, state] of currentState) {
      const prevState = previousState.get(id);
      if (!prevState || 
          prevState.locked !== state.locked ||
          prevState.scheduledUnlock !== state.scheduledUnlock) {
        return true;
      }
    }
    return false;
  }, []);
  
  useEffect(() => {
    if (!materials || !currentDevflix || !path) return;
    
    const checkMaterials = () => {
      const now = new Date().getTime();
      
      // Evitar verificações muito frequentes
      if (lastCheckRef.current && (now - lastCheckRef.current) < 30000) {
        return;
      }
      
      lastCheckRef.current = now;
      
      // Obter estado atual dos materiais
      const currentState = getMaterialsState(materials);
      const hasChanges = hasStateChanged(currentState, lastUnlockStateRef.current);
      
      // Verificar se há materiais que devem ser desbloqueados
      let shouldUnlock = false;
      let unlockCount = 0;
      
      materials.forEach(classM => {
        if (classM.items) {
          classM.items.forEach(item => {
            if (item.locked && item.scheduledUnlock) {
              const unlockTime = new Date(item.scheduledUnlock).getTime();
              if (unlockTime <= now) {
                shouldUnlock = true;
                unlockCount++;
              }
            }
          });
        }
      });
      
      // Se há materiais para desbloquear ou houve mudanças
      if (shouldUnlock || hasChanges) {
        console.log(`[MaterialsUnlockChecker] ${unlockCount} materials need unlocking`);
        
        // Limpar cache para forçar atualização
        cacheService.invalidate(`devflix-${path}`);
        cacheService.invalidateMaterials(path);
        
        // Emitir evento para atualizar dados
        eventBus.emit(MATERIAL_EVENTS.DATA_REFRESH_NEEDED, {
          path,
          reason: 'scheduled_unlock',
          itemsToUnlock: unlockCount
        });
        
        // Só recarregar se excedeu tentativas e ainda há itens bloqueados
        if (shouldUnlock && reloadAttempts.current < MAX_RELOAD_ATTEMPTS) {
          reloadAttempts.current++;
          
          // Aguardar processamento do backend antes de recarregar
          setTimeout(() => {
            // Verificar se realmente precisa recarregar
            const needsReload = materials.some(classM => 
              classM.items?.some(item => {
                if (item.locked && item.scheduledUnlock) {
                  const unlockTime = new Date(item.scheduledUnlock).getTime();
                  return unlockTime <= Date.now();
                }
                return false;
              })
            );
            
            if (needsReload) {
              console.log('[MaterialsUnlockChecker] Reloading page to reflect changes');
              window.location.reload();
            }
          }, 3000);
        }
      }
      
      // Atualizar estado anterior
      lastUnlockStateRef.current = currentState;
    };
    
    // Verificar imediatamente
    checkMaterials();
    
    // Verificar a cada minuto
    const interval = setInterval(checkMaterials, 60000);
    
    // Escutar eventos de sincronização
    const handleSync = eventBus.on(MATERIAL_EVENTS.MATERIALS_SYNCED, (data) => {
      if (data.path === path) {
        console.log('[MaterialsUnlockChecker] Materials synced, checking...');
        checkMaterials();
      }
    });
    
    return () => {
      clearInterval(interval);
      handleSync();
    };
  }, [materials, currentDevflix, path, getMaterialsState, hasStateChanged]);
  
  return null; // Componente não renderiza nada
};

export default MaterialsUnlockChecker;