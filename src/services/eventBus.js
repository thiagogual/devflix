/**
 * Event Bus - Sistema de eventos centralizado para comunicação entre componentes
 * 
 * Implementa o padrão Publisher-Subscriber para:
 * - Desacoplamento entre componentes
 * - Comunicação em tempo real
 * - Sincronização de estado
 * - Notificações de mudanças
 */

class EventBus {
  constructor() {
    this.events = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  /**
   * Registra um listener para um evento
   */
  on(eventName, callback, options = {}) {
    if (!eventName || typeof callback !== 'function') {
      throw new Error('Event name and callback are required');
    }

    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      id: this.generateListenerId()
    };

    // Adicionar listener ordenado por prioridade
    const listeners = Array.from(this.events.get(eventName));
    listeners.push(listener);
    listeners.sort((a, b) => b.priority - a.priority);
    this.events.set(eventName, new Set(listeners));

    this.log(`Listener registered for: ${eventName}`);

    // Retorna função para remover o listener
    return () => this.off(eventName, listener.id);
  }

  /**
   * Registra um listener que será executado apenas uma vez
   */
  once(eventName, callback, options = {}) {
    return this.on(eventName, callback, { ...options, once: true });
  }

  /**
   * Remove um listener específico
   */
  off(eventName, listenerId) {
    if (!this.events.has(eventName)) return;

    const listeners = this.events.get(eventName);
    const filtered = Array.from(listeners).filter(l => l.id !== listenerId);
    
    if (filtered.length === 0) {
      this.events.delete(eventName);
    } else {
      this.events.set(eventName, new Set(filtered));
    }

    this.log(`Listener removed from: ${eventName}`);
  }

  /**
   * Remove todos os listeners de um evento
   */
  removeAllListeners(eventName) {
    if (eventName) {
      this.events.delete(eventName);
      this.log(`All listeners removed from: ${eventName}`);
    } else {
      this.events.clear();
      this.log('All listeners removed');
    }
  }

  /**
   * Emite um evento para todos os listeners
   */
  emit(eventName, data = null) {
    // Adicionar ao histórico
    this.addToHistory(eventName, data);

    if (!this.events.has(eventName)) {
      this.log(`No listeners for event: ${eventName}`);
      return;
    }

    const listeners = Array.from(this.events.get(eventName));
    const listenersToRemove = [];

    listeners.forEach(listener => {
      try {
        listener.callback(data);
        
        // Se é um listener de uso único, marcar para remoção
        if (listener.once) {
          listenersToRemove.push(listener.id);
        }
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });

    // Remover listeners de uso único
    listenersToRemove.forEach(id => this.off(eventName, id));

    this.log(`Event emitted: ${eventName}`, data);
  }

  /**
   * Emite um evento de forma assíncrona
   */
  async emitAsync(eventName, data = null) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit(eventName, data);
        resolve();
      }, 0);
    });
  }

  /**
   * Aguarda por um evento específico
   */
  waitFor(eventName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout waiting for event: ${eventName}`));
      }, timeout);

      const cleanup = this.once(eventName, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  }

  /**
   * Gera ID único para listener
   */
  generateListenerId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Adiciona evento ao histórico
   */
  addToHistory(eventName, data) {
    this.eventHistory.push({
      eventName,
      data,
      timestamp: Date.now()
    });

    // Limitar tamanho do histórico
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Obtém histórico de eventos
   */
  getHistory(eventName = null) {
    if (eventName) {
      return this.eventHistory.filter(e => e.eventName === eventName);
    }
    return [...this.eventHistory];
  }

  /**
   * Limpa histórico de eventos
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Log condicional baseado no modo de debug
   */
  log(...args) {
    if (this.debugMode) {
      console.log('[EventBus]', ...args);
    }
  }

  /**
   * Obtém estatísticas do event bus
   */
  getStats() {
    const stats = {
      totalEvents: this.events.size,
      totalListeners: 0,
      events: {}
    };

    this.events.forEach((listeners, eventName) => {
      stats.totalListeners += listeners.size;
      stats.events[eventName] = listeners.size;
    });

    return stats;
  }
}

// Eventos predefinidos para materiais
export const MATERIAL_EVENTS = {
  MATERIAL_UNLOCKED: 'material:unlocked',
  MATERIAL_LOCKED: 'material:locked',
  MATERIAL_UPDATED: 'material:updated',
  MATERIAL_ADDED: 'material:added',
  MATERIAL_DELETED: 'material:deleted',
  MATERIALS_SYNCED: 'materials:synced',
  SCHEDULE_CHECK_COMPLETED: 'schedule:check:completed',
  CACHE_INVALIDATED: 'cache:invalidated',
  DATA_REFRESH_NEEDED: 'data:refresh:needed'
};

// Eventos predefinidos para instâncias
export const INSTANCE_EVENTS = {
  INSTANCE_LOADED: 'instance:loaded',
  INSTANCE_UPDATED: 'instance:updated',
  INSTANCE_PUBLISHED: 'instance:published',
  INSTANCE_UNPUBLISHED: 'instance:unpublished'
};

// Criar instância única (Singleton)
const eventBus = new EventBus();

// Exportar instância e constantes
export default eventBus;