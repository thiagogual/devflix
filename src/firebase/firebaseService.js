// src/firebase/firebaseService.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// Referências às coleções
const devflixCollection = collection(db, 'devflix-instances');
const pollsCollection = collection(db, 'polls');

// src/firebase/firebaseService.js (Add this function)


// Update home buttons configuration
export const updateHomeButtons = async (instanceId, buttonsData) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    await updateDoc(docRef, { 
      homeButtons: buttonsData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar configurações de botões:", error);
    throw error;
  }
};

// Update schedule "Comece por AQUI" data
export const updateScheduleStartData = async (instanceId, startMapData) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    await updateDoc(docRef, { 
      scheduleStartData: startMapData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados do cronograma inicial:", error);
    throw error;
  }
};

// Get about course data
export const getAboutCourse = async (instanceId) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.aboutCourse || null;
    }
    
    return null;
  } catch (error) {
    console.error("Erro ao obter dados sobre o curso:", error);
    throw error;
  }
};

// Update about course data
export const updateAboutCourse = async (instanceId, aboutData) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    await updateDoc(docRef, { 
      aboutCourse: aboutData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados sobre o curso:", error);
    throw error;
  }
};

// Get schedule "Comece por AQUI" data
export const getScheduleStartData = async (instanceId) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.scheduleStartData || [];
    }
    return [];
  } catch (error) {
    console.error("Erro ao obter dados do cronograma inicial:", error);
    throw error;
  }
};

// Update schedule complete data
export const updateScheduleData = async (instanceId, scheduleData) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    await updateDoc(docRef, { 
      scheduleData: scheduleData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar dados do cronograma:", error);
    throw error;
  }
};

// Get schedule complete data
export const getScheduleData = async (instanceId) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.scheduleData || [];
    }
    return [];
  } catch (error) {
    console.error("Erro ao obter dados do cronograma:", error);
    throw error;
  }
};

// Update header buttons configuration
export const updateHeaderButtonsConfig = async (instanceId, buttonsConfig) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    await updateDoc(docRef, { 
      headerButtonsConfig: buttonsConfig,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar configuração dos botões do header:", error);
    throw error;
  }
};

// Get header buttons configuration
export const getHeaderButtonsConfig = async (instanceId) => {
  // Configuração padrão com todos os botões
  const defaultConfig = {
    home: { enabled: true, label: 'Home' },
    materiais: { enabled: true, label: 'Materiais de Apoio' },
    cronograma: { enabled: true, label: 'Cronograma' },
    aquecimento: { enabled: true, label: 'Aquecimento' },
    nossosAlunos: { enabled: true, label: 'Alunos Transformados', url: 'https://stars.devclub.com.br' },
    aiChat: { enabled: true, label: 'Fale com a IA' }
  };

  try {
    const docRef = doc(devflixCollection, instanceId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Merge com a configuração padrão para garantir que novos botões estejam disponíveis
      const savedConfig = data.headerButtonsConfig || {};
      return { ...defaultConfig, ...savedConfig };
    }
    return defaultConfig;
  } catch (error) {
    console.error("Erro ao obter configuração dos botões do header:", error);
    throw error;
  }
};

// Get cronograma descriptions
export const getCronogramaDescriptions = async (instanceId) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.cronogramaDescriptions || {};
    }
    return {};
  } catch (error) {
    console.error("Erro ao obter descrições do cronograma:", error);
    throw error;
  }
};

// Update cronograma descriptions
export const updateCronogramaDescriptions = async (instanceId, descriptions) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    await updateDoc(docRef, {
      cronogramaDescriptions: descriptions,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar descrições do cronograma:", error);
    throw error;
  }
};

// Obter todas as instâncias da DevFlix
export const getAllDevflixInstances = async () => {
  try {
    const snapshot = await getDocs(devflixCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erro ao obter instâncias DevFlix:", error);
    throw error;
  }
};

// Obter uma instância específica por ID
export const getDevflixById = async (id) => {
  try {
    const docRef = doc(devflixCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log("Documento não encontrado!");
      return null;
    }
  } catch (error) {
    console.error("Erro ao obter instância DevFlix:", error);
    throw error;
  }
};

// Obter uma instância pela URL path
export const getDevflixByPath = async (path) => {
  try {
    // Se não houver caminho, retornar erro
    if (!path) {
      throw new Error("Caminho não especificado");
    }
    
    // Buscar a instância pelo path
    const q = query(devflixCollection, where("path", "==", path));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } else {
      // Se não encontrar o path, retorna null (será tratado como erro no contexto)
      return null;
    }
  } catch (error) {
    console.error("Erro ao obter instância DevFlix por path:", error);
    throw error;
  }
};

// Adicionar nova instância DevFlix
// Update to the addDevflixInstance function in src/firebase/firebaseService.js

// Adicionar nova instância DevFlix
// Update to the addDevflixInstance function in src/firebase/firebaseService.js

// src/firebase/firebaseService.js (Add backgroundVideo field)

// Update initialization in addDevflixInstance
export const addDevflixInstance = async (data) => {
  try {
    // Verificar se o path já existe
    const q = query(devflixCollection, where("path", "==", data.path));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error(`O caminho '${data.path}' já está em uso.`);
    }
    
    // Estrutura inicial padrão
    const newInstance = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      classes: data.classes || [
        {
          id: '1',
          title: 'Aula 1',
          coverImage: '/images/aula1.jpg',
          videoLink: ''
        },
        {
          id: '2',
          title: 'Aula 2',
          coverImage: '/images/aula2.jpg',
          videoLink: ''
        },
        {
          id: '3',
          title: 'Aula 3',
          coverImage: '/images/aula3.jpg',
          videoLink: ''
        },
        {
          id: '4',
          title: 'Aula 4',
          coverImage: '/images/aula4.jpg',
          videoLink: ''
        }
      ],
      materials: data.materials || [
        { classId: '1', items: [] },
        { classId: '2', items: [] },
        { classId: '3', items: [] },
        { classId: '4', items: [] }
      ],
      banner: data.banner || {
        title: '',
        text: 'Bem-vindo à DevFlix!',
        buttonText: 'Saiba mais',
        backgroundColor: '#E50914',
        buttonColor: '#141414',
        buttonLink: '#',
        titleColor: '#ffffff',
        textColor: '#ffffff',
        buttonTextColor: '#ffffff',
        scheduledVisibility: null
      },
      homeButtons: data.homeButtons || {
        primary: {
          text: 'Assistir Agora',
          url: ''
        },
        secondary: {
          enabled: true,
          text: 'Materiais de Apoio',
          url: '/materiais'
        },
        whatsapp: {
          enabled: false,
          text: 'Entre no Grupo VIP do WhatsApp',
          url: 'https://chat.whatsapp.com/example'
        }
      },
      headerLinks: data.headerLinks || [
        {
          id: 'link-home',
          title: 'Home',
          url: '/',
          visible: true,
          order: 0
        },
        {
          id: 'link-materials',
          title: 'Materiais de Apoio',
          url: '/materiais',
          visible: true,
          order: 1
        }
      ],
      heroImage: data.heroImage || '/images/bg-hero.jpg',
      instructorImage: data.instructorImage || '/images/instructor.png',
      backgroundVideo: data.backgroundVideo || '/videos/background.mp4',
      bannerEnabled: data.bannerEnabled !== undefined ? data.bannerEnabled : false,
      isPublished: data.isPublished !== undefined ? data.isPublished : true
    };
    
    const docRef = await addDoc(devflixCollection, newInstance);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao adicionar instância DevFlix:", error);
    throw error;
  }
};

// Duplicar uma instância DevFlix existente
// Update to the duplicateDevflixInstance function in src/firebase/firebaseService.js

// Duplicar uma instância DevFlix existente
export const duplicateDevflixInstance = async (id, newPath, newName, classDates = {}) => {
  try {
    // Buscar a instância original
    const originalInstance = await getDevflixById(id);

    if (!originalInstance) {
      throw new Error("Instância original não encontrada");
    }

    // Verificar se o path já existe
    const q = query(devflixCollection, where("path", "==", newPath));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error(`O caminho '${newPath}' já está em uso.`);
    }

    // Criar uma nova instância com base na original
    const duplicatedInstance = {
      name: newName,
      path: newPath,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      classes: [...originalInstance.classes],
      materials: [...originalInstance.materials],
      banner: {...originalInstance.banner},
      bannerEnabled: originalInstance.bannerEnabled,
      // Copy home buttons configuration
      homeButtons: originalInstance.homeButtons
        ? {...originalInstance.homeButtons}
        : {
            primary: { text: 'Assistir Agora', url: '' },
            secondary: { text: 'Materiais de Apoio', url: '/materiais' },
            whatsapp: { enabled: false, text: 'Entre no Grupo VIP do WhatsApp', url: 'https://chat.whatsapp.com/example' }
          },
      // Copy hero and instructor images
      heroImage: originalInstance.heroImage || '/images/bg-hero.jpg',
      instructorImage: originalInstance.instructorImage || '/images/instructor.png',
      backgroundVideo: originalInstance.backgroundVideo || '/videos/background.mp4',
      headerLinks: originalInstance.headerLinks
        ? [...originalInstance.headerLinks]
        : [
            {
              id: 'link-home',
              title: 'Home',
              url: '/',
              visible: true,
              order: 0
            },
            {
              id: 'link-materials',
              title: 'Materiais de Apoio',
              url: '/materiais',
              visible: true,
              order: 1
            }
          ],
      // Copy header buttons configuration
      headerButtonsConfig: originalInstance.headerButtonsConfig
        ? {...originalInstance.headerButtonsConfig}
        : null,
      // Copy Aquecimento/Schedule Start data (with deep copy for gifts)
      scheduleStartData: originalInstance.scheduleStartData
        ? originalInstance.scheduleStartData.map(item => ({
            ...item,
            gifts: item.gifts ? item.gifts.map(gift => ({
              ...gift,
              challenge: gift.challenge ? {...gift.challenge} : null
            })) : []
          }))
        : [],
      // Copy Cronograma descriptions
      cronogramaDescriptions: originalInstance.cronogramaDescriptions
        ? {...originalInstance.cronogramaDescriptions}
        : {},
      // Copy About Course data
      aboutCourse: originalInstance.aboutCourse
        ? {...originalInstance.aboutCourse}
        : null,
      // Copy initial banner settings
      initialBanner: originalInstance.initialBanner
        ? {...originalInstance.initialBanner}
        : null,
      // NEW class dates (not from original, but from user input)
      classDates: classDates,
      isPublished: false // Por padrão, a instância duplicada não é publicada
    };

    const docRef = await addDoc(devflixCollection, duplicatedInstance);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao duplicar instância DevFlix:", error);
    throw error;
  }
};

// Atualizar instância DevFlix existente
export const updateDevflixInstance = async (id, data) => {
  try {
    // Se estiver atualizando o path, verificar se já existe
    if (data.path) {
      const q = query(devflixCollection, where("path", "==", data.path));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty && snapshot.docs[0].id !== id) {
        throw new Error(`O caminho '${data.path}' já está em uso.`);
      }
    }
    
    // Adicionar timestamp de atualização
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    const docRef = doc(devflixCollection, id);
    await updateDoc(docRef, updateData);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar instância DevFlix:", error);
    throw error;
  }
};

// Excluir instância DevFlix
export const deleteDevflixInstance = async (id) => {
  try {
    const docRef = doc(devflixCollection, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Erro ao excluir instância DevFlix:", error);
    throw error;
  }
};

// Atualizar links do cabeçalho de uma instância
export const updateHeaderLinks = async (instanceId, links) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    await updateDoc(docRef, { 
      headerLinks: links,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar links do cabeçalho:", error);
    throw error;
  }
};

// Alternar o status de publicação de uma instância
export const togglePublishStatus = async (instanceId, isPublished) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    await updateDoc(docRef, { 
      isPublished: isPublished,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao alterar status de publicação:", error);
    throw error;
  }
};

// Atualizar materiais de apoio de uma aula
// CORREÇÃO: Lê dados frescos do Firebase imediatamente antes de escrever,
// e escreve de volta de forma atômica para evitar race conditions.
export const updateClassMaterials = async (instanceId, classId, materials) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Instância não encontrada");
    }

    const currentData = docSnap.data();
    const currentMaterials = currentData.materials || [];

    const materialIndex = currentMaterials.findIndex(m => m.classId === classId);

    let updatedMaterials;

    if (materialIndex === -1) {
      updatedMaterials = [...currentMaterials, { classId, items: materials }];
    } else {
      updatedMaterials = currentMaterials.map(item =>
        item.classId === classId ? { classId, items: materials } : item
      );
    }

    // Escrever diretamente no documento sem passar por updateDevflixInstance
    await updateDoc(docRef, {
      materials: updatedMaterials,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Erro ao atualizar materiais:", error);
    throw error;
  }
};

// Atualizar informações de uma aula
// CORREÇÃO: Lê dados frescos do Firebase antes de escrever
export const updateClassInfo = async (instanceId, classId, classData) => {
  try {
    const docRef = doc(devflixCollection, instanceId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Instância não encontrada");
    }

    const currentData = docSnap.data();
    const currentClasses = currentData.classes || [];

    const updatedClasses = currentClasses.map(item =>
      item.id === classId ? { ...item, ...classData } : item
    );

    await updateDoc(docRef, {
      classes: updatedClasses,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Erro ao atualizar informações da aula:", error);
    throw error;
  }
};

// Atualizar configurações do banner
export const updateBannerSettings = async (instanceId, bannerData, enabled) => {
  try {
    // Garantir que os campos de cores tenham valores padrão, se não especificados
    const updatedBannerData = {
      ...bannerData,
      title: bannerData.title || '',
      titleColor: bannerData.titleColor || '#ffffff',
      textColor: bannerData.textColor || '#ffffff',
      buttonTextColor: bannerData.buttonTextColor || '#ffffff'
    };
    
    await updateDevflixInstance(instanceId, {
      bannerEnabled: enabled !== undefined ? enabled : true,
      banner: updatedBannerData
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar banner:", error);
    throw error;
  }
};

// Atualizar configurações do banner inicial
export const updateInitialBannerSettings = async (instanceId, bannerData) => {
  try {
    await updateDevflixInstance(instanceId, {
      initialBanner: {
        enabled: bannerData.enabled || false,
        displayMode: bannerData.displayMode || 'always', // 'always' ou 'once'
        visualMode: bannerData.visualMode || 'transparent', // 'transparent', 'blur', 'solid'
        title: bannerData.title || '',
        text: bannerData.text || '',
        image: bannerData.image || '',
        video: bannerData.video || '',
        buttonText: bannerData.buttonText || '',
        buttonLink: bannerData.buttonLink || '',
        titleColor: bannerData.titleColor || '#ffffff',
        textColor: bannerData.textColor || '#ffffff',
        buttonTextColor: bannerData.buttonTextColor || '#ffffff',
        buttonBgColor: bannerData.buttonBgColor || '#e50914',
        bgColor: bannerData.bgColor || '#000000',
        opacity: bannerData.opacity || 0.9,
        blurAmount: bannerData.blurAmount || 10
      }
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar banner inicial:", error);
    throw error;
  }
};

// ==================== POLLS / ENQUETES ====================

// Obter todas as enquetes de uma instancia
export const getPolls = async (instanceId) => {
  try {
    const q = query(pollsCollection, where("instanceId", "==", instanceId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("Erro ao obter enquetes:", error);
    throw error;
  }
};

// Obter enquete por ID do step (aquecimento)
export const getPollByStepId = async (instanceId, stepId) => {
  try {
    const q = query(
      pollsCollection,
      where("instanceId", "==", instanceId),
      where("stepId", "==", stepId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter enquete:", error);
    throw error;
  }
};

// Criar nova enquete
export const createPoll = async (pollData) => {
  try {
    const newPoll = {
      ...pollData,
      votes: {},
      voters: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(pollsCollection, newPoll);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar enquete:", error);
    throw error;
  }
};

// Atualizar enquete
export const updatePoll = async (pollId, pollData) => {
  try {
    const docRef = doc(pollsCollection, pollId);
    await updateDoc(docRef, {
      ...pollData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Erro ao atualizar enquete:", error);
    throw error;
  }
};

// Deletar enquete
export const deletePoll = async (pollId) => {
  try {
    const docRef = doc(pollsCollection, pollId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Erro ao deletar enquete:", error);
    throw error;
  }
};

// Votar em uma enquete
export const votePoll = async (pollId, optionId, visitorId) => {
  try {
    const docRef = doc(pollsCollection, pollId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Enquete nao encontrada");
    }

    const pollData = docSnap.data();
    const currentVotes = pollData.votes || {};
    const currentVoters = pollData.voters || {};

    // Verificar se o usuario ja votou
    const previousVote = currentVoters[visitorId];

    // Se ja votou na mesma opcao, nao faz nada
    if (previousVote === optionId) {
      return { success: true, message: "Voce ja votou nesta opcao" };
    }

    // Se ja votou em outra opcao, remove o voto anterior
    if (previousVote) {
      currentVotes[previousVote] = Math.max(0, (currentVotes[previousVote] || 1) - 1);
    }

    // Adiciona o novo voto
    currentVotes[optionId] = (currentVotes[optionId] || 0) + 1;
    currentVoters[visitorId] = optionId;

    // Atualiza no Firebase
    await updateDoc(docRef, {
      votes: currentVotes,
      voters: currentVoters,
      updatedAt: serverTimestamp()
    });

    return { success: true, message: previousVote ? "Voto alterado com sucesso" : "Voto registrado com sucesso" };
  } catch (error) {
    console.error("Erro ao votar:", error);
    throw error;
  }
};

// Listener em tempo real para enquete
export const subscribeToPoll = (pollId, callback) => {
  const docRef = doc(pollsCollection, pollId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({
        id: docSnap.id,
        ...docSnap.data()
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error("Erro no listener da enquete:", error);
  });
};

// Obter voto do usuario em uma enquete
export const getUserVote = async (pollId, visitorId) => {
  try {
    const docRef = doc(pollsCollection, pollId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const pollData = docSnap.data();
      return pollData.voters?.[visitorId] || null;
    }
    return null;
  } catch (error) {
    console.error("Erro ao obter voto do usuario:", error);
    throw error;
  }
};