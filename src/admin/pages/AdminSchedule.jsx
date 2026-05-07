// src/admin/pages/AdminSchedule.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import {
  updateScheduleStartData,
  getScheduleStartData
} from '../../firebase/firebaseService';

// Função para extrair ID do YouTube e gerar URL embed
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  console.log('Admin - Processing URL:', url);
  
  // Se já é uma URL de embed, retorna como está
  if (url.includes('youtube.com/embed/')) {
    console.log('Admin - Already embed URL:', url);
    return url;
  }
  
  // Extrair ID do YouTube de diferentes formatos de URL
  let videoId = null;
  
  // https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0];
    console.log('Admin - Extracted ID from watch URL:', videoId);
  }
  // https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
    console.log('Admin - Extracted ID from short URL:', videoId);
  }
  
  // Se encontrou o ID, cria URL embed
  if (videoId) {
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    console.log('Admin - Generated embed URL:', embedUrl);
    return embedUrl;
  }
  
  console.log('Admin - Could not process URL, returning original:', url);
  return url; // Retorna URL original se não conseguir processar
};

const AdminSchedule = () => {
  const { currentDevflix } = useAdmin();
  const [startMapData, setStartMapData] = useState([
    {
      id: 1,
      title: "Bem-vindo à Jornada!",
      description: "Antes de começarmos, é importante entender o que você vai aprender e como nossa metodologia funciona.",
      videoUrl: ""
    },
    {
      id: 2,
      title: "Configurando o Ambiente",
      description: "Vamos preparar todas as ferramentas necessárias para o desenvolvimento.",
      videoUrl: ""
    },
    {
      id: 3,
      title: "Primeiros Conceitos",
      description: "Aprenda os fundamentos básicos que você precisa dominar.",
      videoUrl: ""
    },
    {
      id: 4,
      title: "Projeto Prático",
      description: "Coloque a mão na massa com seu primeiro projeto real.",
      videoUrl: ""
    }
  ]);

  const [editingItem, setEditingItem] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Adicionar novo item ao Comece por AQUI
  const addStartMapItem = () => {
    const newItem = {
      id: Date.now(),
      title: "Novo Passo",
      description: "Descrição do novo passo",
      videoUrl: "",
      gifts: []
    };
    setStartMapData([...startMapData, newItem]);
    setHasUnsavedChanges(true);
  };

  // Tipos de desafio disponíveis
  const challengeTypes = [
    { value: 'none', label: 'Sem desafio (acesso direto)', icon: '✅' },
    { value: 'youtube_reminder', label: 'Ativar lembrete no YouTube', icon: '🔔' },
    { value: 'whatsapp_group', label: 'Entrar no grupo de WhatsApp', icon: '💬' },
    { value: 'calendar', label: 'Adicionar evento à agenda', icon: '📅' },
    { value: 'custom', label: 'Link personalizado', icon: '🔗' }
  ];

  // Adicionar presente/link a um item
  const addGiftToItem = (itemId) => {
    setStartMapData(prevData =>
      prevData.map(item =>
        item.id === itemId
          ? {
              ...item,
              gifts: [
                ...(item.gifts || []),
                {
                  id: Date.now(),
                  title: "Novo Presente",
                  url: "",
                  icon: "gift",
                  challenge: {
                    enabled: false,
                    type: 'none',
                    url: '',
                    buttonText: 'Desbloquear'
                  }
                }
              ]
            }
          : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Remover presente/link de um item
  const removeGiftFromItem = (itemId, giftId) => {
    setStartMapData(prevData =>
      prevData.map(item =>
        item.id === itemId
          ? { ...item, gifts: (item.gifts || []).filter(g => g.id !== giftId) }
          : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Atualizar presente/link
  const updateGift = (itemId, giftId, field, value) => {
    setStartMapData(prevData =>
      prevData.map(item =>
        item.id === itemId
          ? {
              ...item,
              gifts: (item.gifts || []).map(g =>
                g.id === giftId ? { ...g, [field]: value } : g
              )
            }
          : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Atualizar challenge do presente
  const updateGiftChallenge = (itemId, giftId, field, value) => {
    setStartMapData(prevData =>
      prevData.map(item =>
        item.id === itemId
          ? {
              ...item,
              gifts: (item.gifts || []).map(g =>
                g.id === giftId
                  ? {
                      ...g,
                      challenge: {
                        ...(g.challenge || { enabled: false, type: 'none', url: '', buttonText: 'Desbloquear' }),
                        [field]: value
                      }
                    }
                  : g
              )
            }
          : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Remover item do Comece por AQUI
  const removeStartMapItem = (itemId) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      setStartMapData(startMapData.filter(item => item.id !== itemId));
      setHasUnsavedChanges(true);
    }
  };

  // Mover item para cima
  const moveItemUp = (index) => {
    if (index === 0) return;
    const newData = [...startMapData];
    [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
    setStartMapData(newData);
    setHasUnsavedChanges(true);
  };

  // Mover item para baixo
  const moveItemDown = (index) => {
    if (index === startMapData.length - 1) return;
    const newData = [...startMapData];
    [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
    setStartMapData(newData);
    setHasUnsavedChanges(true);
  };

  const handleItemChange = (itemId, field, value) => {
    setStartMapData(prevData =>
      prevData.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  // Template padrão para o aquecimento
  const applyDefaultTemplate = () => {
    const defaultData = [
      {
        id: 1,
        title: "Bem-vindo à Jornada!",
        description: "Antes de começarmos, é importante entender o que você vai aprender e como nossa metodologia funciona.",
        videoUrl: "",
        gifts: []
      },
      {
        id: 2,
        title: "Configurando o Ambiente",
        description: "Vamos preparar todas as ferramentas necessárias para o desenvolvimento.",
        videoUrl: "",
        gifts: []
      },
      {
        id: 3,
        title: "Primeiros Conceitos",
        description: "Aprenda os fundamentos básicos que você precisa dominar.",
        videoUrl: "",
        gifts: []
      },
      {
        id: 4,
        title: "Projeto Prático",
        description: "Coloque a mão na massa com seu primeiro projeto real.",
        videoUrl: "",
        gifts: []
      }
    ];
    setStartMapData(defaultData);
    setHasUnsavedChanges(true);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!currentDevflix?.id) return;
      
      try {
        // Carregar dados do "Comece por AQUI"
        const startData = await getScheduleStartData(currentDevflix.id);
        if (startData && startData.length > 0) {
          setStartMapData(startData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do cronograma:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDevflix]);

  const saveChanges = async () => {
    if (!currentDevflix?.id) {
      alert('Nenhuma instância selecionada');
      return;
    }

    try {
      await updateScheduleStartData(currentDevflix.id, startMapData);
      setHasUnsavedChanges(false);
      alert('Dados salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar dados');
    }
  };

  const resetChanges = async () => {
    if (!currentDevflix?.id) return;

    try {
      const originalData = await getScheduleStartData(currentDevflix.id);
      setStartMapData(originalData || []);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro ao resetar dados:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-netflix-red rounded-full mx-auto mb-4"></div>
          <p className="text-white">Carregando dados do cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Página de Aquecimento</h1>
              <p className="text-gray-400">Configure os passos da página "Comece por AQUI" que aparece em /{currentDevflix?.path}/aquecimento</p>
            </div>
            <button
              onClick={applyDefaultTemplate}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              Template Padrão
            </button>
          </div>
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

        {/* Start Map Editor */}
        {(
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Editor - Comece por AQUI</h2>
              <button
                onClick={addStartMapItem}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Novo Passo
              </button>
            </div>
            
            {startMapData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-netflix-dark rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-white">Passo {index + 1}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveItemUp(index)}
                        disabled={index === 0}
                        className={`p-2 rounded transition-colors ${
                          index === 0 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                        title="Mover para cima"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveItemDown(index)}
                        disabled={index === startMapData.length - 1}
                        className={`p-2 rounded transition-colors ${
                          index === startMapData.length - 1
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                        }`}
                        title="Mover para baixo"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        editingItem === item.id
                          ? 'bg-netflix-red text-white'
                          : 'bg-gray-600 hover:bg-gray-500 text-white'
                      }`}
                    >
                      {editingItem === item.id ? 'Minimizar' : 'Editar'}
                    </button>
                    <button
                      onClick={() => removeStartMapItem(item.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Remover item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {editingItem === item.id && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Título</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">URL do Vídeo (YouTube ou Gumlet Embed)</label>
                        <input
                          type="url"
                          value={item.videoUrl}
                          onChange={(e) => handleItemChange(item.id, 'videoUrl', e.target.value)}
                          placeholder="https://youtube.com/watch?v=... ou https://play.gumlet.io/embed/..."
                          className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                        />
                        <p className="text-gray-500 text-xs mt-1">
                          YouTube: youtube.com/watch?v=... | Gumlet: play.gumlet.io/embed/...
                        </p>
                      </div>
                    </div>

                    {/* Gumlet Thumbnail Config - só aparece se for URL do Gumlet */}
                    {item.videoUrl && item.videoUrl.includes('gumlet') && (
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-purple-400 text-lg">🎬</span>
                          <h4 className="text-white font-medium">Configuração da Thumbnail do Gumlet</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                          Para exibir a thumbnail do vídeo, preencha o Collection ID e Asset ID do Gumlet.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Collection ID</label>
                            <input
                              type="text"
                              value={item.gumletCollectionId || ''}
                              onChange={(e) => handleItemChange(item.id, 'gumletCollectionId', e.target.value)}
                              placeholder="Ex: 6924be9d3869244bc998995c"
                              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-300 text-sm mb-1">Asset ID</label>
                            <input
                              type="text"
                              value={item.gumletAssetId || ''}
                              onChange={(e) => handleItemChange(item.id, 'gumletAssetId', e.target.value)}
                              placeholder="Ex: 697bbc961c1aa8b68dfb7f11"
                              className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        {item.gumletCollectionId && item.gumletAssetId && (
                          <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                            <p className="text-gray-400 text-xs mb-2">Preview da Thumbnail:</p>
                            <img
                              src={`https://video.gumlet.io/${item.gumletCollectionId}/${item.gumletAssetId}/thumbnail-1-0.png`}
                              alt="Thumbnail preview"
                              className="w-48 aspect-video object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <p className="text-green-400 text-xs mt-2">
                              ✓ URL: https://video.gumlet.io/{item.gumletCollectionId}/{item.gumletAssetId}/thumbnail-1-0.png
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <label className="block text-white font-medium mb-2">Descrição</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        rows="3"
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:border-netflix-red focus:outline-none"
                      />
                    </div>

                    {/* Presentes/Links */}
                    <div className="border border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-medium flex items-center gap-2">
                            <span className="text-xl">🎁</span>
                            Presentes / Links Extras
                          </h4>
                          <p className="text-gray-400 text-sm mt-1">
                            Adicione links de materiais, downloads ou bônus para os alunos
                          </p>
                        </div>
                        <button
                          onClick={() => addGiftToItem(item.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Adicionar Presente
                        </button>
                      </div>

                      {(item.gifts || []).length === 0 ? (
                        <div className="text-center py-6 bg-gray-800/50 rounded-lg border border-dashed border-gray-600">
                          <span className="text-4xl mb-2 block">🎁</span>
                          <p className="text-gray-400 text-sm">Nenhum presente adicionado</p>
                          <p className="text-gray-500 text-xs mt-1">Clique em "Adicionar Presente" para incluir links extras</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(item.gifts || []).map((gift, giftIndex) => (
                            <div key={gift.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                              {/* Header do presente */}
                              <div className="flex items-start gap-4 mb-4">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-gray-400 text-sm mb-1">Título do Presente</label>
                                    <input
                                      type="text"
                                      value={gift.title}
                                      onChange={(e) => updateGift(item.id, gift.id, 'title', e.target.value)}
                                      placeholder="Ex: Apostila Completa"
                                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-netflix-red focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-gray-400 text-sm mb-1">URL do Presente (destino final)</label>
                                    <input
                                      type="url"
                                      value={gift.url}
                                      onChange={(e) => updateGift(item.id, gift.id, 'url', e.target.value)}
                                      placeholder="https://..."
                                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-netflix-red focus:outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={gift.icon || 'gift'}
                                    onChange={(e) => updateGift(item.id, gift.id, 'icon', e.target.value)}
                                    className="bg-gray-700 text-white border border-gray-600 rounded-lg px-2 py-2 text-sm focus:border-netflix-red focus:outline-none"
                                  >
                                    <option value="gift">🎁 Presente</option>
                                    <option value="download">📥 Download</option>
                                    <option value="book">📚 Apostila</option>
                                    <option value="link">🔗 Link</option>
                                    <option value="video">🎬 Vídeo</option>
                                    <option value="code">💻 Código</option>
                                    <option value="star">⭐ Especial</option>
                                  </select>
                                  <button
                                    onClick={() => removeGiftFromItem(item.id, gift.id)}
                                    className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
                                    title="Remover presente"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {/* Seção de Desafio/Desbloqueio */}
                              <div className="border-t border-gray-700 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">🔒</span>
                                    <span className="text-white font-medium text-sm">Desafio para Desbloquear</span>
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <span className="text-gray-400 text-sm">
                                      {gift.challenge?.enabled ? 'Ativado' : 'Desativado'}
                                    </span>
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={gift.challenge?.enabled || false}
                                        onChange={(e) => updateGiftChallenge(item.id, gift.id, 'enabled', e.target.checked)}
                                        className="sr-only"
                                      />
                                      <div className={`w-10 h-5 rounded-full transition-colors ${
                                        gift.challenge?.enabled ? 'bg-netflix-red' : 'bg-gray-600'
                                      }`}>
                                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                                          gift.challenge?.enabled ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                      </div>
                                    </div>
                                  </label>
                                </div>

                                {gift.challenge?.enabled && (
                                  <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
                                    <p className="text-gray-400 text-xs">
                                      O usuário precisará completar o desafio para desbloquear o presente. Após clicar no link do desafio, o presente será liberado automaticamente.
                                    </p>

                                    {/* Tipo de desafio */}
                                    <div>
                                      <label className="block text-gray-400 text-sm mb-2">Tipo de Desafio</label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {challengeTypes.filter(t => t.value !== 'none').map(type => (
                                          <button
                                            key={type.value}
                                            onClick={() => updateGiftChallenge(item.id, gift.id, 'type', type.value)}
                                            className={`p-3 rounded-lg border text-left transition-all ${
                                              gift.challenge?.type === type.value
                                                ? 'border-netflix-red bg-netflix-red/20 text-white'
                                                : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                                            }`}
                                          >
                                            <span className="text-lg mr-2">{type.icon}</span>
                                            <span className="text-sm">{type.label}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* URL do desafio */}
                                    <div>
                                      <label className="block text-gray-400 text-sm mb-1">
                                        URL do Desafio
                                        <span className="text-gray-500 ml-1">
                                          {gift.challenge?.type === 'youtube_reminder' && '(Link do vídeo/canal YouTube)'}
                                          {gift.challenge?.type === 'whatsapp_group' && '(Link do grupo WhatsApp)'}
                                          {gift.challenge?.type === 'calendar' && '(Link do Google Calendar/evento)'}
                                          {gift.challenge?.type === 'custom' && '(Qualquer link)'}
                                        </span>
                                      </label>
                                      <input
                                        type="url"
                                        value={gift.challenge?.url || ''}
                                        onChange={(e) => updateGiftChallenge(item.id, gift.id, 'url', e.target.value)}
                                        placeholder={
                                          gift.challenge?.type === 'youtube_reminder' ? 'https://youtube.com/watch?v=...' :
                                          gift.challenge?.type === 'whatsapp_group' ? 'https://chat.whatsapp.com/...' :
                                          gift.challenge?.type === 'calendar' ? 'https://calendar.google.com/...' :
                                          'https://...'
                                        }
                                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-netflix-red focus:outline-none"
                                      />
                                    </div>

                                    {/* Texto do botão */}
                                    <div>
                                      <label className="block text-gray-400 text-sm mb-1">Texto do Botão no Modal</label>
                                      <input
                                        type="text"
                                        value={gift.challenge?.buttonText || 'Desbloquear'}
                                        onChange={(e) => updateGiftChallenge(item.id, gift.id, 'buttonText', e.target.value)}
                                        placeholder="Ex: Ativar Lembrete"
                                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:border-netflix-red focus:outline-none"
                                      />
                                    </div>

                                    {/* Preview do modal */}
                                    <div className="bg-gray-800 rounded-lg p-4 border border-dashed border-gray-600">
                                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Preview do Modal:</p>
                                      <div className="bg-black/50 rounded-lg p-4 text-center">
                                        <span className="text-4xl block mb-2">🔒</span>
                                        <p className="text-white font-bold mb-1">Desbloqueie seu presente!</p>
                                        <p className="text-gray-400 text-sm mb-4">
                                          {gift.challenge?.type === 'youtube_reminder' && 'Ative o lembrete no YouTube para desbloquear'}
                                          {gift.challenge?.type === 'whatsapp_group' && 'Entre no grupo do WhatsApp para desbloquear'}
                                          {gift.challenge?.type === 'calendar' && 'Adicione o evento à sua agenda para desbloquear'}
                                          {gift.challenge?.type === 'custom' && 'Complete o desafio para desbloquear'}
                                          {!gift.challenge?.type && 'Selecione um tipo de desafio'}
                                        </p>
                                        <div className="inline-flex items-center gap-2 bg-netflix-red text-white px-4 py-2 rounded-lg text-sm">
                                          {gift.challenge?.type === 'youtube_reminder' && '🔔'}
                                          {gift.challenge?.type === 'whatsapp_group' && '💬'}
                                          {gift.challenge?.type === 'calendar' && '📅'}
                                          {gift.challenge?.type === 'custom' && '🔗'}
                                          {gift.challenge?.buttonText || 'Desbloquear'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Preview */}
                    <div className="border border-gray-600 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-4">Pré-visualização</h4>
                      <div className="bg-gray-900 rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-netflix-red rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white font-bold text-lg mb-2">{item.title}</h5>
                            <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
                            {item.videoUrl && (
                              <button className="mt-3 inline-flex items-center gap-2 bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Assistir Agora
                              </button>
                            )}
                            {/* Preview dos presentes */}
                            {(item.gifts || []).length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Presentes incluídos:</p>
                                <div className="flex flex-wrap gap-2">
                                  {(item.gifts || []).map(gift => {
                                    const iconMap = {
                                      gift: '🎁',
                                      download: '📥',
                                      book: '📚',
                                      link: '🔗',
                                      video: '🎬',
                                      code: '💻',
                                      star: '⭐'
                                    };
                                    const hasChallenge = gift.challenge?.enabled;
                                    return (
                                      <span key={gift.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                        hasChallenge
                                          ? 'bg-yellow-600/20 text-yellow-400'
                                          : 'bg-green-600/20 text-green-400'
                                      }`}>
                                        {hasChallenge && <span>🔒</span>}
                                        <span>{iconMap[gift.icon] || '🎁'}</span>
                                        {gift.title}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editingItem !== item.id && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Título:</span>
                      <p className="text-white truncate">{item.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Vídeo:</span>
                      <p className="text-white truncate">{item.videoUrl ? '✅ Configurado' : '❌ Não configurado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Presentes:</span>
                      <p className="text-white truncate">
                        {(item.gifts || []).length > 0
                          ? `🎁 ${(item.gifts || []).length} presente(s)`
                          : '❌ Nenhum'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Com desafio:</span>
                      <p className="text-white truncate">
                        {(item.gifts || []).filter(g => g.challenge?.enabled).length > 0
                          ? `🔒 ${(item.gifts || []).filter(g => g.challenge?.enabled).length} bloqueado(s)`
                          : '✅ Nenhum'}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedule;