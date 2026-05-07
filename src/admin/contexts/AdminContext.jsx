// src/admin/contexts/AdminContext.jsx (com duplicação)
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  generateId, 
  getDefaultDevflix
} from '../utils/adminHelpers';
import { 
  getAllDevflixInstances, 
  getDevflixById, 
  updateHomeButtons as updateHomeButtonsInFirebase,
  addDevflixInstance as addDevflixToFirebase, 
  updateDevflixInstance as updateDevflixInFirebase, 
  deleteDevflixInstance as deleteDevflixFromFirebase,
  duplicateDevflixInstance as duplicateDevflixInFirebase,
  updateClassMaterials,
  updateClassInfo,
  updateBannerSettings,
  updateInitialBannerSettings
} from '../../firebase/firebaseService';
import { 
  updateHeaderLinks as updateHeaderLinksInFirebase,
  togglePublishStatus as togglePublishStatusInFirebase 
} from '../../firebase/firebaseService';

// Cria o contexto
const AdminContext = createContext();

// Provider Component
export const AdminProvider = ({ children }) => {
  const [devflixInstances, setDevflixInstances] = useState([]);
  const [currentDevflix, setCurrentDevflix] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregamento inicial de dados do Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Buscar todas as instâncias do Firebase
        const instances = await getAllDevflixInstances();
        setDevflixInstances(instances);
        
        // Selecionar a primeira instância, se existir
        if (instances.length > 0) {
          setCurrentDevflix(instances[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateHomeButtons = async (buttonsData) => {
    if (!currentDevflix) return;
    
    try {
      // Atualizar no Firebase
      await updateHomeButtonsInFirebase(currentDevflix.id, buttonsData);
      
      // Atualizar estado local
      const updated = { ...currentDevflix, homeButtons: buttonsData };
      setCurrentDevflix(updated);
      
      // Atualizar a lista de instâncias
      setDevflixInstances(prev => prev.map(instance => 
        instance.id === currentDevflix.id ? updated : instance
      ));
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar botões:', err);
      setError('Falha ao atualizar botões.');
      throw err;
    }
  };

  // Função para adicionar uma nova instância DevFlix
  const addDevflixInstance = async (newInstance) => {
    try {
      // Adicionar instância no Firebase
      const newId = await addDevflixToFirebase(newInstance);
      
      // Buscar a instância completa
      const addedInstance = await getDevflixById(newId);
      
      // Atualizar estado local
      setDevflixInstances(prev => [...prev, addedInstance]);
      
      return newId;
    } catch (err) {
      console.error('Erro ao adicionar instância:', err);
      setError('Falha ao adicionar instância. Verifique se o caminho é único.');
      throw err;
    }
  };

  // Nova função para duplicar uma instância DevFlix
  const duplicateDevflixInstance = async (id, newPath, newName, classDates = {}) => {
    try {
      setIsLoading(true);

      // Duplicar a instância no Firebase
      const newId = await duplicateDevflixInFirebase(id, newPath, newName, classDates);

      // Buscar a instância completa
      const duplicatedInstance = await getDevflixById(newId);

      // Atualizar estado local
      setDevflixInstances(prev => [...prev, duplicatedInstance]);

      // Selecionar a nova instância
      setCurrentDevflix(duplicatedInstance);

      setIsLoading(false);
      return newId;
    } catch (err) {
      console.error('Erro ao duplicar instância:', err);
      setError('Falha ao duplicar instância. Verifique se o caminho é único.');
      setIsLoading(false);
      throw err;
    }
  };

  // Função para atualizar uma instância existente
  const updateDevflixInstance = async (id, updatedData) => {
    try {
      // Atualizar no Firebase
      await updateDevflixInFirebase(id, updatedData);
      
      // Atualizar estado local para refletir as mudanças
      const updatedInstances = devflixInstances.map(instance => 
        instance.id === id ? { ...instance, ...updatedData } : instance
      );
      
      setDevflixInstances(updatedInstances);
      
      // Também atualiza o currentDevflix se estiver editando a instância selecionada
      if (currentDevflix && currentDevflix.id === id) {
        setCurrentDevflix(prev => ({ ...prev, ...updatedData }));
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar instância:', err);
      setError('Falha ao atualizar instância.');
      throw err;
    }
  };

  // Função para deletar uma instância
  const deleteDevflixInstance = async (id) => {
    try {
      // Deletar no Firebase
      await deleteDevflixFromFirebase(id);
      
      // Atualizar estado local
      const updatedInstances = devflixInstances.filter(instance => instance.id !== id);
      setDevflixInstances(updatedInstances);
      
      // Se a instância atual foi deletada, selecionar outra
      if (currentDevflix && currentDevflix.id === id) {
        setCurrentDevflix(updatedInstances.length > 0 ? updatedInstances[0] : null);
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao excluir instância:', err);
      setError('Falha ao excluir instância.');
      throw err;
    }
  };

  // Função para selecionar uma instância
  const selectDevflix = async (id) => {
    try {
      // Buscar os dados atualizados no Firebase
      const instance = await getDevflixById(id);
      
      if (instance) {
        setCurrentDevflix(instance);
      } else {
        throw new Error('Instância não encontrada');
      }
    } catch (err) {
      console.error('Erro ao selecionar instância:', err);
      setError('Falha ao selecionar instância.');
    }
  };

  // Função para atualizar materiais de apoio
  const updateMaterials = async (classId, materials) => {
    if (!currentDevflix) return;
    
    try {
      // Verificar se já existe um item para esta classId
      const hasMaterials = currentDevflix.materials.some(m => m.classId === classId);
      
      let updatedMaterials;
      
      // Se não existe, adiciona um novo item
      if (!hasMaterials) {
        updatedMaterials = [...currentDevflix.materials, { classId, items: materials }];
      } else {
        // Se existe, atualiza o item existente
        updatedMaterials = currentDevflix.materials.map(item => 
          item.classId === classId ? { classId, items: materials } : item
        );
      }
      
      // Atualizar no Firebase
      await updateClassMaterials(currentDevflix.id, classId, materials);
      
      // Atualizar estado local
      const updated = { ...currentDevflix, materials: updatedMaterials };
      setCurrentDevflix(updated);
      
      // Atualizar a lista de instâncias
      setDevflixInstances(prev => prev.map(instance => 
        instance.id === currentDevflix.id ? updated : instance
      ));
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar materiais:', err);
      setError('Falha ao atualizar materiais.');
      throw err;
    }
  };

  // Função para adicionar material de apoio
  const addMaterial = async (classId, material) => {
    if (!currentDevflix) return;
    
    try {
      // Encontrar os materiais para esta aula
      const classMaterials = currentDevflix.materials.find(m => m.classId === classId);
      
      const newMaterial = {
        id: `${classId}-${generateId()}`,
        ...material
      };
      
      // Se não existe, criar um novo para esta aula
      if (!classMaterials) {
        const newClassMaterials = {
          classId,
          items: [newMaterial]
        };
        
        const updatedMaterials = [...currentDevflix.materials, newClassMaterials];
        
        // Atualizar no Firebase
        await updateClassMaterials(currentDevflix.id, classId, [newMaterial]);
        
        // Atualizar estado local
        const updated = { ...currentDevflix, materials: updatedMaterials };
        setCurrentDevflix(updated);
        
        // Atualizar a lista de instâncias
        setDevflixInstances(prev => prev.map(instance => 
          instance.id === currentDevflix.id ? updated : instance
        ));
      } else {
        // Se existe, adicionar ao existente
        const updatedItems = [...classMaterials.items, newMaterial];
        
        // Atualizar no Firebase e no estado local
        await updateMaterials(classId, updatedItems);
      }
      
      return newMaterial.id;
    } catch (err) {
      console.error('Erro ao adicionar material:', err);
      setError('Falha ao adicionar material.');
      throw err;
    }
  };

  // Função para atualizar material de apoio
  const updateMaterial = async (classId, materialId, updatedData) => {
    if (!currentDevflix) return;
    
    try {
      const classMaterials = currentDevflix.materials.find(m => m.classId === classId);
      
      if (classMaterials) {
        const updatedItems = classMaterials.items.map(item => 
          item.id === materialId ? { ...item, ...updatedData } : item
        );
        
        // Atualizar no Firebase e no estado local
        await updateMaterials(classId, updatedItems);
        
        return true;
      }
    } catch (err) {
      console.error('Erro ao atualizar material:', err);
      setError('Falha ao atualizar material.');
      throw err;
    }
  };

  // Função para deletar material de apoio
  const deleteMaterial = async (classId, materialId) => {
    if (!currentDevflix) return;
    
    try {
      const classMaterials = currentDevflix.materials.find(m => m.classId === classId);
      
      if (classMaterials) {
        const updatedItems = classMaterials.items.filter(item => item.id !== materialId);
        
        // Atualizar no Firebase e no estado local
        await updateMaterials(classId, updatedItems);
        
        return true;
      }
    } catch (err) {
      console.error('Erro ao excluir material:', err);
      setError('Falha ao excluir material.');
      throw err;
    }
  };

  // Função para atualizar informações das aulas
  const updateClass = async (classId, updatedData) => {
    if (!currentDevflix) return;
    
    try {
      const updatedClasses = currentDevflix.classes.map(classItem => 
        classItem.id === classId ? { ...classItem, ...updatedData } : classItem
      );
      
      // Atualizar no Firebase
      await updateClassInfo(currentDevflix.id, classId, updatedData);
      
      // Atualizar estado local
      const updated = { ...currentDevflix, classes: updatedClasses };
      setCurrentDevflix(updated);
      
      // Atualizar a lista de instâncias
      setDevflixInstances(prev => prev.map(instance => 
        instance.id === currentDevflix.id ? updated : instance
      ));
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar aula:', err);
      setError('Falha ao atualizar aula.');
      throw err;
    }
  };

  // Função para atualizar o banner
  const updateBanner = async (bannerData) => {
    if (!currentDevflix) return;
    
    try {
      const updatedBanner = { ...currentDevflix.banner, ...bannerData };
      
      // Atualizar no Firebase
      await updateBannerSettings(currentDevflix.id, updatedBanner, currentDevflix.bannerEnabled);
      
      // Atualizar estado local
      const updated = { ...currentDevflix, banner: updatedBanner };
      setCurrentDevflix(updated);
      
      // Atualizar a lista de instâncias
      setDevflixInstances(prev => prev.map(instance => 
        instance.id === currentDevflix.id ? updated : instance
      ));
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar banner:', err);
      setError('Falha ao atualizar banner.');
      throw err;
    }
  };

  // Função para ativar/desativar o banner
  const toggleBanner = async (enabled) => {
    if (!currentDevflix) return;
    
    try {
      // Atualizar no Firebase
      await updateBannerSettings(currentDevflix.id, currentDevflix.banner, enabled);
      
      // Atualizar estado local
      const updated = { ...currentDevflix, bannerEnabled: enabled };
      setCurrentDevflix(updated);
      
      // Atualizar a lista de instâncias
      setDevflixInstances(prev => prev.map(instance => 
        instance.id === currentDevflix.id ? updated : instance
      ));
      
      return true;
    } catch (err) {
      console.error('Erro ao alterar status do banner:', err);
      setError('Falha ao alterar status do banner.');
      throw err;
    }
  };

  // Função para atualizar o banner inicial
  const updateInitialBanner = async (bannerData) => {
    if (!currentDevflix) return;
    
    try {
      const updatedBanner = { 
        ...(currentDevflix.initialBanner || {}), 
        ...bannerData 
      };
      
      // Atualizar no Firebase
      await updateInitialBannerSettings(currentDevflix.id, updatedBanner);
      
      // Atualizar estado local
      const updated = { ...currentDevflix, initialBanner: updatedBanner };
      setCurrentDevflix(updated);
      
      // Atualizar a lista de instâncias
      setDevflixInstances(prev => prev.map(instance => 
        instance.id === currentDevflix.id ? updated : instance
      ));
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar banner inicial:', err);
      setError('Falha ao atualizar banner inicial.');
      throw err;
    }
  };

  const updateHeaderLinks = async (links) => {
    if (!currentDevflix) return;
    
    try {
      // Atualizar no Firebase
      await updateHeaderLinksInFirebase(currentDevflix.id, links);
      
      // Atualizar estado local
      const updated = { ...currentDevflix, headerLinks: links };
      setCurrentDevflix(updated);
      
      // Atualizar a lista de instâncias
      setDevflixInstances(prev => prev.map(instance => 
        instance.id === currentDevflix.id ? updated : instance
      ));
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar links do cabeçalho:', err);
      setError('Falha ao atualizar links do cabeçalho.');
      throw err;
    }
  };
  
  // Função para alternar o status de publicação de uma instância
  const togglePublishStatus = async (id, isPublished) => {
    try {
      // Atualizar no Firebase
      await togglePublishStatusInFirebase(id, isPublished);
      
      // Atualizar estado local
      const updatedInstances = devflixInstances.map(instance => 
        instance.id === id ? { ...instance, isPublished } : instance
      );
      
      setDevflixInstances(updatedInstances);
      
      // Também atualizar o currentDevflix se necessário
      if (currentDevflix && currentDevflix.id === id) {
        setCurrentDevflix(prev => ({ ...prev, isPublished }));
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao alterar status de publicação:', err);
      setError('Falha ao alterar status de publicação.');
      throw err;
    }
  };

  const value = {
    devflixInstances,
    currentDevflix,
    isLoading,
    error,
    selectDevflix,
    addDevflixInstance,
    duplicateDevflixInstance,  // Nova função para duplicar
    updateDevflixInstance,
    deleteDevflixInstance,
    updateMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    updateClass,
    updateBanner,
    toggleBanner,
    updateInitialBanner,
    updateHeaderLinks,
    togglePublishStatus,
    updateHomeButtons
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};