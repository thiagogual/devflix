// src/contexts/DevflixContext.jsx
// CORREÇÃO: Aplica desbloqueio de materiais/banner no momento do render,
// sem escrever no Firebase. Isso evita que visitantes com relógio errado
// desbloqueem conteúdo para todo mundo.
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDevflixByPath, getHeaderButtonsConfig } from '../firebase/firebaseService';
import cacheService from '../services/cacheService';
import SupportBubble from '../components/SupportBubble';

const DevflixContext = createContext();

/**
 * Aplica desbloqueios agendados nos dados SEM escrever no Firebase.
 * Apenas modifica a cópia local para exibição.
 */
const applyScheduledUnlocks = (data) => {
  if (!data) return data;

  const now = new Date();
  let modified = false;

  // 1. Desbloquear banner se agendamento passou
  let bannerEnabled = data.bannerEnabled;
  let banner = data.banner;
  if (
    !bannerEnabled &&
    banner?.scheduledVisibility &&
    new Date(banner.scheduledVisibility) <= now
  ) {
    bannerEnabled = true;
    banner = { ...banner, scheduledVisibility: null };
    modified = true;
  }

  // 2. Desbloquear materiais com scheduledUnlock no passado
  let materials = data.materials;
  if (materials && materials.length > 0) {
    materials = materials.map(classMaterials => {
      if (!classMaterials?.items || classMaterials.items.length === 0) {
        return classMaterials;
      }

      let classModified = false;
      const updatedItems = classMaterials.items.map(item => {
        if (item.locked && item.scheduledUnlock && new Date(item.scheduledUnlock) <= now) {
          classModified = true;
          return { ...item, locked: false };
        }
        return item;
      });

      if (classModified) {
        modified = true;
        return { ...classMaterials, items: updatedItems };
      }
      return classMaterials;
    });
  }

  // 3. Ativar links do header com scheduledVisibility no passado
  let headerLinks = data.headerLinks;
  if (headerLinks && headerLinks.length > 0) {
    headerLinks = headerLinks.map(link => {
      if (!link.visible && link.scheduledVisibility && new Date(link.scheduledVisibility) <= now) {
        modified = true;
        return { ...link, visible: true };
      }
      return link;
    });
  }

  if (!modified) return data;

  return { ...data, bannerEnabled, banner, materials, headerLinks };
};

// Provider component
export const DevflixProvider = ({ children }) => {
  const { path } = useParams();
  const navigate = useNavigate();
  const [currentDevflix, setCurrentDevflix] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [headerButtonsConfig, setHeaderButtonsConfig] = useState(null);

  // Load data
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (dataInitialized || !path) return;

      try {
        setIsLoading(true);
        setError(null);
        setBannerVisible(true);

        if (!path) {
          navigate('/');
          return;
        }

        // Check cache
        const cachedData = sessionStorage.getItem(`devflix-${path}`);
        let devflixData;

        if (cachedData) {
          try {
            devflixData = JSON.parse(cachedData);
            if (isMounted) {
              setCurrentDevflix(applyScheduledUnlocks(devflixData));
              setIsLoading(false);
            }
          } catch (parseError) {
            console.warn('Error parsing cached data:', parseError);
            sessionStorage.removeItem(`devflix-${path}`);
          }
        }

        // Always fetch fresh data from Firebase
        try {
          const freshData = await getDevflixByPath(path);

          if (!isMounted) return;

          if (!freshData) {
            navigate(`/error?message=Instância DevFlix "/${path}" não encontrada.&code=404`);
            return;
          }

          if (freshData.isPublished === false) {
            navigate(`/error?message=Instância DevFlix "/${path}" não está disponível no momento.&code=403`);
            return;
          }

          // Aplicar desbloqueios agendados no render (sem escrever no Firebase)
          setCurrentDevflix(applyScheduledUnlocks(freshData));

          // Load header buttons configuration
          try {
            const buttonsConfig = await getHeaderButtonsConfig(freshData.id);
            if (isMounted) {
              setHeaderButtonsConfig(buttonsConfig);
            }
          } catch (configError) {
            console.warn('Error loading header buttons config:', configError);
            setHeaderButtonsConfig({
              home: { enabled: true, label: 'Home' },
              materiais: { enabled: true, label: 'Materiais de Apoio' },
              cronograma: { enabled: true, label: 'Cronograma' },
              aquecimento: { enabled: true, label: 'Aquecimento' },
              nossosAlunos: { enabled: true, label: 'Alunos Transformados', url: 'https://stars.devclub.com.br' },
              aiChat: { enabled: true, label: 'Fale com a IA' }
            });
          }

          // Cache raw data (sem unlock aplicado) para re-avaliar no próximo load
          sessionStorage.setItem(`devflix-${path}`, JSON.stringify(freshData));

          setDataInitialized(true);
        } catch (fetchError) {
          console.error('Error fetching data:', fetchError);
          if (!devflixData) {
            navigate(`/error?message=${encodeURIComponent(fetchError.message || 'Não foi possível carregar os dados.')}&code=500`);
          }
        }
      } catch (err) {
        console.error('Error loading DevFlix data:', err);
        if (isMounted) {
          navigate(`/error?message=${encodeURIComponent('Não foi possível carregar os dados.')}&code=500`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Verificar agendamentos periodicamente (a cada 30s) para atualizar a UI
    // quando um agendamento passa do horário. Apenas atualiza o estado local,
    // NÃO escreve no Firebase.
    const scheduleCheckInterval = setInterval(async () => {
      if (!isMounted || !path) return;

      const cached = sessionStorage.getItem(`devflix-${path}`);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          const unlocked = applyScheduledUnlocks(data);
          if (unlocked !== data) {
            setCurrentDevflix(unlocked);
          }
        } catch (e) {
          // ignore
        }
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(scheduleCheckInterval);
    };
  }, [path, navigate, dataInitialized]);

  const toggleBannerVisibility = useCallback((visible) => {
    setBannerVisible(visible);
  }, []);

  const setCountdownBannerVisible = useCallback((visible) => {
    setCountdownVisible(visible);
  }, []);

  const value = useMemo(() => ({
    currentDevflix,
    isLoading,
    error,
    banner: currentDevflix?.banner,
    bannerEnabled: currentDevflix?.bannerEnabled,
    bannerVisible,
    toggleBannerVisibility,
    countdownVisible,
    setCountdownBannerVisible,
    classes: currentDevflix?.classes || [],
    materials: currentDevflix?.materials || [],
    headerButtonsConfig,
    path
  }), [
    currentDevflix,
    isLoading,
    error,
    bannerVisible,
    toggleBannerVisibility,
    countdownVisible,
    setCountdownBannerVisible,
    headerButtonsConfig,
    path
  ]);

  return (
    <DevflixContext.Provider value={value}>
      <SupportBubble />
      {children}
    </DevflixContext.Provider>
  );
};

export const useDevflix = () => {
  const context = useContext(DevflixContext);
  if (context === undefined) {
    throw new Error('useDevflix must be used within a DevflixProvider');
  }
  return context;
};
