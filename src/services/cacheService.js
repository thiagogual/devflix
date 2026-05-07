/**
 * Cache Service - Gerenciamento centralizado de cache com invalidação inteligente
 * 
 * Este serviço fornece:
 * - Cache com TTL (Time To Live) configurável
 * - Invalidação seletiva e em lote
 * - Versionamento de cache
 * - Listeners para mudanças
 * - Sincronização entre abas
 */

class CacheService {
  constructor() {
    this.CACHE_VERSION = '1.0.0';
    this.CACHE_PREFIX = 'devflix_cache_';
    this.DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos
    this.listeners = new Map();
    this.setupStorageListener();
  }

  /**
   * Gera chave de cache com prefixo e versão
   */
  getCacheKey(key) {
    return `${this.CACHE_PREFIX}${this.CACHE_VERSION}_${key}`;
  }

  /**
   * Armazena dados no cache com TTL
   */
  set(key, data, ttl = this.DEFAULT_TTL) {
    const cacheKey = this.getCacheKey(key);
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
      version: this.CACHE_VERSION
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      this.notifyListeners(key, data, 'set');
      this.broadcastChange(key, 'set');
    } catch (error) {
      console.error('Cache set error:', error);
      // Se o sessionStorage estiver cheio, limpar caches antigos
      this.cleanOldCache();
    }
  }

  /**
   * Recupera dados do cache se ainda válidos
   */
  get(key) {
    const cacheKey = this.getCacheKey(key);
    
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      
      // Verificar versão
      if (cacheData.version !== this.CACHE_VERSION) {
        this.invalidate(key);
        return null;
      }

      // Verificar TTL
      const age = Date.now() - cacheData.timestamp;
      if (age > cacheData.ttl) {
        this.invalidate(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Invalida cache específico
   */
  invalidate(key) {
    const cacheKey = this.getCacheKey(key);
    sessionStorage.removeItem(cacheKey);
    this.notifyListeners(key, null, 'invalidate');
    this.broadcastChange(key, 'invalidate');
  }

  /**
   * Invalida todos os caches que correspondem ao padrão
   */
  invalidatePattern(pattern) {
    const keys = Object.keys(sessionStorage);
    const regex = new RegExp(pattern);
    
    keys.forEach(key => {
      if (regex.test(key)) {
        sessionStorage.removeItem(key);
        const originalKey = key.replace(this.getCacheKey(''), '');
        this.notifyListeners(originalKey, null, 'invalidate');
      }
    });
    
    this.broadcastChange(pattern, 'invalidatePattern');
  }

  /**
   * Invalida caches relacionados a materiais
   */
  invalidateMaterials(instancePath) {
    this.invalidate(`devflix-${instancePath}`);
    this.invalidatePattern(`materials-${instancePath}.*`);
    this.broadcastChange('materials', 'invalidate');
  }

  /**
   * Limpa todos os caches
   */
  clear() {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
    this.notifyListeners('*', null, 'clear');
    this.broadcastChange('*', 'clear');
  }

  /**
   * Limpa caches antigos ou expirados
   */
  cleanOldCache() {
    const keys = Object.keys(sessionStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const cached = sessionStorage.getItem(key);
          const cacheData = JSON.parse(cached);
          
          // Remover se expirado ou versão antiga
          if (cacheData.version !== this.CACHE_VERSION || 
              (now - cacheData.timestamp) > cacheData.ttl) {
            sessionStorage.removeItem(key);
          }
        } catch (error) {
          // Se não conseguir parsear, remover
          sessionStorage.removeItem(key);
        }
      }
    });
  }

  /**
   * Adiciona listener para mudanças no cache
   */
  addListener(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    // Retorna função para remover listener
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * Notifica listeners sobre mudanças
   */
  notifyListeners(key, data, action) {
    // Notificar listeners específicos da chave
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback({ key, data, action });
        } catch (error) {
          console.error('Listener error:', error);
        }
      });
    }

    // Notificar listeners globais
    const globalCallbacks = this.listeners.get('*');
    if (globalCallbacks) {
      globalCallbacks.forEach(callback => {
        try {
          callback({ key, data, action });
        } catch (error) {
          console.error('Global listener error:', error);
        }
      });
    }
  }

  /**
   * Configura listener para sincronização entre abas
   */
  setupStorageListener() {
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.startsWith(this.CACHE_PREFIX)) {
        const originalKey = event.key.replace(this.getCacheKey(''), '');
        
        // Se foi uma mudança em outra aba, notificar listeners
        if (event.newValue === null) {
          this.notifyListeners(originalKey, null, 'invalidate');
        } else {
          try {
            const cacheData = JSON.parse(event.newValue);
            this.notifyListeners(originalKey, cacheData.data, 'set');
          } catch (error) {
            console.error('Storage listener error:', error);
          }
        }
      }
    });
  }

  /**
   * Broadcast mudanças para outras abas usando localStorage
   */
  broadcastChange(key, action) {
    try {
      // Usar localStorage para notificar outras abas
      const broadcastKey = `${this.CACHE_PREFIX}broadcast`;
      localStorage.setItem(broadcastKey, JSON.stringify({
        key,
        action,
        timestamp: Date.now()
      }));
      
      // Limpar após broadcast
      setTimeout(() => {
        localStorage.removeItem(broadcastKey);
      }, 100);
    } catch (error) {
      // Ignorar erros de broadcast
    }
  }

  /**
   * Verifica saúde do cache
   */
  getHealth() {
    const keys = Object.keys(sessionStorage);
    const cacheKeys = keys.filter(k => k.startsWith(this.CACHE_PREFIX));
    const now = Date.now();
    
    let valid = 0;
    let expired = 0;
    let totalSize = 0;

    cacheKeys.forEach(key => {
      try {
        const cached = sessionStorage.getItem(key);
        totalSize += cached.length;
        
        const cacheData = JSON.parse(cached);
        const age = now - cacheData.timestamp;
        
        if (age > cacheData.ttl) {
          expired++;
        } else {
          valid++;
        }
      } catch (error) {
        expired++;
      }
    });

    return {
      total: cacheKeys.length,
      valid,
      expired,
      sizeKB: Math.round(totalSize / 1024),
      version: this.CACHE_VERSION
    };
  }
}

// Exportar instância única (Singleton)
const cacheService = new CacheService();

// Limpar caches expirados ao inicializar
cacheService.cleanOldCache();

// Limpar caches periodicamente (a cada 5 minutos)
setInterval(() => {
  cacheService.cleanOldCache();
}, 5 * 60 * 1000);

export default cacheService;