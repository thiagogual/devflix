// src/admin/pages/AdminHeaderButtons.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import { 
  updateHeaderButtonsConfig, 
  getHeaderButtonsConfig 
} from '../../firebase/firebaseService';

const AdminHeaderButtons = () => {
  const { currentDevflix } = useAdmin();
  const [buttonsConfig, setButtonsConfig] = useState({
    home: { enabled: true, label: 'Home' },
    materiais: { enabled: true, label: 'Materiais de Apoio' },
    cronograma: { enabled: true, label: 'Cronograma' },
    aquecimento: { enabled: true, label: 'Aquecimento' },
    nossosAlunos: { enabled: true, label: 'Alunos Transformados', url: 'https://stars.devclub.com.br' },
    aiChat: { enabled: true, label: 'Fale com a IA' }
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      if (!currentDevflix?.id) return;
      
      try {
        const config = await getHeaderButtonsConfig(currentDevflix.id);
        setButtonsConfig(config);
      } catch (error) {
        console.error('Erro ao carregar configuração dos botões:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [currentDevflix]);

  // Handle button toggle
  const toggleButton = (buttonKey) => {
    setButtonsConfig(prevConfig => ({
      ...prevConfig,
      [buttonKey]: {
        ...prevConfig[buttonKey],
        enabled: !prevConfig[buttonKey].enabled
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Handle label change
  const handleLabelChange = (buttonKey, newLabel) => {
    setButtonsConfig(prevConfig => ({
      ...prevConfig,
      [buttonKey]: {
        ...prevConfig[buttonKey],
        label: newLabel
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Handle URL change (for external buttons)
  const handleUrlChange = (buttonKey, newUrl) => {
    setButtonsConfig(prevConfig => ({
      ...prevConfig,
      [buttonKey]: {
        ...prevConfig[buttonKey],
        url: newUrl
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Save changes
  const saveChanges = async () => {
    if (!currentDevflix?.id) {
      alert('Nenhuma instância selecionada');
      return;
    }

    try {
      await updateHeaderButtonsConfig(currentDevflix.id, buttonsConfig);
      setHasUnsavedChanges(false);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar configurações');
    }
  };

  // Reset changes
  const resetChanges = async () => {
    if (!currentDevflix?.id) return;
    
    try {
      const originalConfig = await getHeaderButtonsConfig(currentDevflix.id);
      setButtonsConfig(originalConfig);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-netflix-red rounded-full mx-auto mb-4"></div>
          <p className="text-white">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  const buttonsList = [
    {
      key: 'home',
      name: 'Home',
      description: 'Link para a página inicial',
      type: 'internal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      key: 'materiais',
      name: 'Materiais de Apoio',
      description: 'Link para a página de materiais',
      type: 'internal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      key: 'cronograma',
      name: 'Cronograma',
      description: 'Link para a página do cronograma',
      type: 'internal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      key: 'aquecimento',
      name: 'Aquecimento',
      description: 'Link para a página de aquecimento',
      type: 'internal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      )
    },
    {
      key: 'nossosAlunos',
      name: 'Nossos Alunos',
      description: 'Link externo para página de depoimentos',
      type: 'external',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      key: 'aiChat',
      name: 'Chat com IA',
      description: 'Botão para abrir o chat com IA',
      type: 'modal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-netflix-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Configurar Botões do Header</h1>
          <p className="text-gray-300">Escolha quais botões aparecerão no menu de navegação</p>
        </div>

        {/* Save/Reset Buttons */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex space-x-4"
          >
            <button
              onClick={saveChanges}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Salvar Alterações
            </button>
            <button
              onClick={resetChanges}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Descartar Alterações
            </button>
          </motion.div>
        )}

        {/* Buttons Configuration */}
        <div className="space-y-6">
          {buttonsList.map((button, index) => (
            <motion.div
              key={button.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-netflix-dark rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-start gap-6">
                {/* Button Icon & Toggle */}
                <div className="flex-shrink-0 flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    buttonsConfig[button.key]?.enabled 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {button.icon}
                  </div>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={buttonsConfig[button.key]?.enabled || false}
                      onChange={() => toggleButton(button.key)}
                      className="w-5 h-5 rounded bg-gray-800 border-gray-600 text-netflix-red focus:ring-netflix-red focus:ring-offset-0"
                    />
                    <span className="text-white font-medium">Habilitado</span>
                  </label>
                </div>

                {/* Button Details */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{button.name}</h3>
                  <p className="text-gray-400 mb-4">{button.description}</p>
                  
                  <div className="space-y-3">
                    {/* Label Configuration */}
                    <div>
                      <label className="block text-white font-medium mb-2">Texto do Botão</label>
                      <input
                        type="text"
                        value={buttonsConfig[button.key]?.label || ''}
                        onChange={(e) => handleLabelChange(button.key, e.target.value)}
                        disabled={!buttonsConfig[button.key]?.enabled}
                        className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-2 focus:outline-none ${
                          buttonsConfig[button.key]?.enabled 
                            ? 'border-gray-600 focus:border-netflix-red' 
                            : 'border-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    {/* URL Configuration for external buttons */}
                    {button.type === 'external' && (
                      <div>
                        <label className="block text-white font-medium mb-2">URL do Link</label>
                        <input
                          type="url"
                          value={buttonsConfig[button.key]?.url || ''}
                          onChange={(e) => handleUrlChange(button.key, e.target.value)}
                          disabled={!buttonsConfig[button.key]?.enabled}
                          placeholder="https://exemplo.com"
                          className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-2 focus:outline-none ${
                            buttonsConfig[button.key]?.enabled 
                              ? 'border-gray-600 focus:border-netflix-red' 
                              : 'border-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    buttonsConfig[button.key]?.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {buttonsConfig[button.key]?.enabled ? 'Ativo' : 'Desativado'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Preview Section */}
        <div className="mt-12 bg-netflix-dark rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Pré-visualização do Header</h3>
          <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
            <div className="text-netflix-red font-bold text-2xl">
              DEV<span className="text-white">FLIX</span>
            </div>
            
            <div className="flex items-center space-x-6">
              {buttonsList
                .filter(button => buttonsConfig[button.key]?.enabled)
                .map(button => (
                  <span 
                    key={button.key} 
                    className="text-white hover:text-netflix-red transition-colors cursor-pointer"
                  >
                    {buttonsConfig[button.key]?.label}
                  </span>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeaderButtons;