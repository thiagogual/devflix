// src/admin/utils/adminHelpers.js

// Função para salvar dados no localStorage
export const saveToStorage = (data) => {
    try {
      localStorage.setItem('devflixInstances', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  };
  
  // Função para validar formato de URL
  export const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  // Função para validar formato de caminho
  export const isValidPath = (path) => {
    const pathPattern = /^[a-z0-9\-]+$/;
    return pathPattern.test(path);
  };
  
  // Função para gerar ID único
  export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Função para formatar data
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Função que retorna um novo objeto de banner padrão
  export const getDefaultBanner = () => {
    return {
      text: 'Aproveite a promoção por tempo limitado!',
      buttonText: 'Garantir Vaga',
      backgroundColor: '#E50914',
      buttonColor: '#222222',
      buttonLink: 'https://exemplo.com/promo'
    };
  };
  
  // Função que retorna um novo objeto de DevFlix padrão
 // src/admin/utils/adminHelpers.js (update getDefaultDevflix function)

// Função que retorna um novo objeto de DevFlix padrão
export const getDefaultDevflix = (name, path) => {
  return {
    id: generateId(),
    name,
    path,
    bannerEnabled: false,
    banner: getDefaultBanner(),
    classes: [
      {
        id: '1',
        title: 'Aula 1: Introdução ao HTML e CSS',
        coverImage: '/images/aula1.jpg',
        videoLink: 'https://exemplo.com/aula1'
      },
      {
        id: '2',
        title: 'Aula 2: JavaScript Básico',
        coverImage: '/images/aula2.jpg',
        videoLink: 'https://exemplo.com/aula2'
      },
      {
        id: '3',
        title: 'Aula 3: React Fundamentos',
        coverImage: '/images/aula3.jpg',
        videoLink: 'https://exemplo.com/aula3'
      },
      {
        id: '4',
        title: 'Aula 4: Projeto Final',
        coverImage: '/images/aula4.jpg',
        videoLink: 'https://exemplo.com/aula4'
      }
    ],
    materials: [
      {
        classId: '1',
        items: []
      },
      {
        classId: '2',
        items: []
      },
      {
        classId: '3',
        items: []
      },
      {
        classId: '4',
        items: []
      }
    ],
    // Adding default home buttons configuration
    homeButtons: {
      primary: {
        text: 'Assistir Agora',
        url: ''
      },
      secondary: {
        text: 'Materiais de Apoio',
        url: '/materiais'
      },
      whatsapp: {
        enabled: false,
        text: 'Entre no Grupo VIP do WhatsApp',
        url: 'https://chat.whatsapp.com/example'
      }
    },
    // Add heroImage and instructorImage fields
    heroImage: '/images/bg-hero.jpg',
    instructorImage: '/images/instructor.png'
  };
};
  