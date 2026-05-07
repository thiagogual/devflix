// src/services/devflixService.js

// Simulação de dados armazenados (em um ambiente real, viria de uma API ou banco de dados)
const initialDevflixData = [
    {
      id: '1',
      name: 'DevFlix 16',
      path: 'dev-16',
      bannerEnabled: true,
      banner: {
        text: 'Aproveite 50% de desconto nos próximos 3 dias!',
        buttonText: 'Garantir Vaga',
        backgroundColor: '#ff3f3f',
        buttonColor: '#222222',
        buttonLink: 'https://exemplo.com/promo'
      },
      classes: [
        {
          id: '1',
          title: 'Aula 1: Introdução ao HTML e CSS',
          coverImage: '../assets/THUMB-01.jpg',
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
          items: [
            { id: '1-1', title: 'Slides da Aula 1', url: '#', type: 'slides', locked: false },
            { id: '1-2', title: 'Código dos Exemplos', url: '#', type: 'code', locked: false },
            { id: '1-3', title: 'Exercícios Práticos', url: '#', type: 'exercise', locked: true },
          ]
        },
        {
          classId: '2',
          items: [
            { id: '2-1', title: 'Slides da Aula 2', url: '#', type: 'slides', locked: false },
            { id: '2-2', title: 'Código dos Exemplos', url: '#', type: 'code', locked: true },
          ]
        },
        {
          classId: '3',
          items: [
            { id: '3-1', title: 'Slides da Aula 3', url: '#', type: 'slides', locked: false },
            { id: '3-2', title: 'Repositório do Projeto', url: '#', type: 'code', locked: true },
          ]
        },
        {
          classId: '4',
          items: [
            { id: '4-1', title: 'Slides da Aula 4', url: '#', type: 'slides', locked: false },
            { id: '4-2', title: 'Código Final', url: '#', type: 'code', locked: true },
          ]
        }
      ]
    },
    {
      id: '2',
      name: 'DevFlix 17',
      path: 'dev-17',
      bannerEnabled: false,
      banner: {
        text: '',
        buttonText: '',
        backgroundColor: '#3366ff',
        buttonColor: '#ffffff',
        buttonLink: ''
      },
      classes: [
        {
          id: '1',
          title: 'Aula 1: HTML e CSS Avançados',
          coverImage: '../assets/THUMB-01.jpg',
          videoLink: 'https://exemplo.com/aula1-nova'
        },
        {
          id: '2',
          title: 'Aula 2: JavaScript ES6+',
          coverImage: '/images/aula2.jpg',
          videoLink: 'https://exemplo.com/aula2-nova'
        },
        {
          id: '3',
          title: 'Aula 3: React Hooks',
          coverImage: '/images/aula3.jpg',
          videoLink: 'https://exemplo.com/aula3-nova'
        },
        {
          id: '4',
          title: 'Aula 4: Deploy de Aplicações',
          coverImage: '/images/aula4.jpg',
          videoLink: 'https://exemplo.com/aula4-nova'
        }
      ],
      materials: [
        {
          classId: '1',
          items: [
            { id: '1-1', title: 'Slides da Aula 1', url: '#', type: 'slides', locked: false },
            { id: '1-2', title: 'Exemplos CSS Grid', url: '#', type: 'code', locked: false },
          ]
        },
        {
          classId: '2',
          items: [
            { id: '2-1', title: 'Slides da Aula 2', url: '#', type: 'slides', locked: false },
            { id: '2-2', title: 'Exemplos Práticos', url: '#', type: 'exercise', locked: true },
          ]
        },
        {
          classId: '3',
          items: [
            { id: '3-1', title: 'Slides da Aula 3', url: '#', type: 'slides', locked: false },
          ]
        },
        {
          classId: '4',
          items: [
            { id: '4-1', title: 'Slides da Aula 4', url: '#', type: 'slides', locked: false },
            { id: '4-2', title: 'Guia de Deploy', url: '#', type: 'doc', locked: false },
          ]
        }
      ]
    }
  ];
  
  // Função para obter dados do localStorage ou usar os dados iniciais
  const getStoredData = () => {
    try {
      const storedData = localStorage.getItem('devflixInstances');
      return storedData ? JSON.parse(storedData) : initialDevflixData;
    } catch (error) {
      console.error('Erro ao recuperar dados armazenados:', error);
      return initialDevflixData;
    }
  };
  
  // Obter instância da DevFlix com base no caminho da URL
  export const getDevflixByPath = (path) => {
    const instances = getStoredData();
    
    // Se não houver caminho, retorne a primeira instância
    if (!path) {
      return instances[0];
    }
    
    // Procurar a instância pelo caminho
    const instance = instances.find(inst => inst.path === path);
    
    // Retorna a instância encontrada ou a primeira instância como fallback
    return instance || instances[0];
  };
  
  // Obter materiais de apoio para uma determinada aula
  export const getMaterialsByClassId = (devflixId, classId) => {
    const instances = getStoredData();
    const instance = instances.find(inst => inst.id === devflixId);
    
    if (!instance) return [];
    
    const classMaterials = instance.materials.find(m => m.classId === classId);
    return classMaterials ? classMaterials.items : [];
  };
  
  // Obter todas as instâncias da DevFlix
  export const getAllDevflixInstances = () => {
    return getStoredData();
  };