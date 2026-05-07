// src/admin/components/HeaderLinksEditor.jsx (com programação de visibilidade)
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import ScheduledUnlockField from './ScheduledUnlockField';

const HeaderLinksEditor = () => {
  const { currentDevflix, updateHeaderLinks } = useAdmin();
  const [links, setLinks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para o formulário
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formVisible, setFormVisible] = useState(true);
  const [formOrder, setFormOrder] = useState(0);
  const [formScheduledVisibility, setFormScheduledVisibility] = useState(null);
  
  // Lista de IDs de links fixos que não devem ser excluídos ou completamente editados
  const fixedLinkIds = ['link-home', 'link-materials', 'link-ai'];
  
  // Atualiza os links quando o DevFlix atual muda
  useEffect(() => {
    if (currentDevflix && currentDevflix.headerLinks) {
      // Verificar se os links fixos existem, senão adicioná-los
      let updatedLinks = [...currentDevflix.headerLinks];
      
      // Verificar link Home
      if (!updatedLinks.find(link => link.id === 'link-home')) {
        updatedLinks.push({
          id: 'link-home',
          title: 'Home',
          url: '/',
          visible: true,
          order: 0
        });
      }
      
      // Verificar link Materiais
      if (!updatedLinks.find(link => link.id === 'link-materials')) {
        updatedLinks.push({
          id: 'link-materials',
          title: 'Materiais de Apoio',
          url: '/materiais',
          visible: true,
          order: 1
        });
      }
      
      // Verificar link IA (não é exibido na lista, mas está no navbar)
      if (!updatedLinks.find(link => link.id === 'link-ai')) {
        updatedLinks.push({
          id: 'link-ai',
          title: 'Fale com a IA',
          url: '#',
          visible: true,
          order: 999 // Sempre último
        });
      }
      
      // Ordenar os links por ordem
      updatedLinks.sort((a, b) => a.order - b.order);
      
      setLinks(updatedLinks);
    } else {
      // Links padrão se não houver nenhum
      setLinks([
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
        },
        {
          id: 'link-ai',
          title: 'Fale com a IA',
          url: '#',
          visible: true,
          order: 999
        }
      ]);
    }
  }, [currentDevflix]);
  
  // Verifica se algum link deve ser visível com base no agendamento
  useEffect(() => {
    const checkScheduledLinks = () => {
      if (!links.length) return;
      
      const now = new Date().getTime();
      const hasScheduledItems = links.some(link => 
        !link.visible && 
        link.scheduledVisibility && 
        new Date(link.scheduledVisibility).getTime() <= now
      );
      
      if (hasScheduledItems) {
        // Atualizar links com agendamentos vencidos
        const updatedLinks = links.map(link => {
          if (
            !link.visible && 
            link.scheduledVisibility && 
            new Date(link.scheduledVisibility).getTime() <= now
          ) {
            return {
              ...link, 
              visible: true,
              scheduledVisibility: null // Limpar o agendamento após tornar visível
            };
          }
          return link;
        });
        
        // Atualizar no Firebase
        updateHeaderLinks(updatedLinks).catch(error => {
          console.error('Erro ao atualizar links agendados:', error);
        });
        
        // Atualizar o estado local
        setLinks(updatedLinks);
      }
    };
    
    // Verificar links agendados ao carregar e a cada minuto
    checkScheduledLinks();
    const interval = setInterval(checkScheduledLinks, 60000);
    
    return () => clearInterval(interval);
  }, [links, updateHeaderLinks]);
  
  const resetForm = () => {
    setFormTitle('');
    setFormUrl('');
    setFormVisible(true);
    setFormOrder(links.filter(link => !fixedLinkIds.includes(link.id)).length + 2); // +2 para os links fixos
    setFormScheduledVisibility(null);
    setEditingId(null);
  };
  
  const handleAddClick = () => {
    setShowForm(true);
    resetForm();
    // Define a ordem para ser após os links fixos
    setFormOrder(links.filter(link => !fixedLinkIds.includes(link.id)).length + 2);
  };
  
  const handleEditClick = (link) => {
    // Não permitir edição completa de links fixos
    const isFixedLink = fixedLinkIds.includes(link.id);
    
    setShowForm(true);
    setEditingId(link.id);
    setFormTitle(link.title);
    setFormUrl(link.url);
    
    // Se for link fixo, permitir apenas editar visibilidade
    if (isFixedLink) {
      setFormVisible(link.visible);
      setFormOrder(link.order);
    } else {
      setFormVisible(link.visible);
      setFormOrder(link.order);
      setFormScheduledVisibility(link.scheduledVisibility || null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Verificar se é um link fixo
      const isFixedLink = editingId && fixedLinkIds.includes(editingId);
      
      let linkData;
      
      if (isFixedLink) {
        // Para links fixos, manter URL e ordem originais, alterar apenas visibilidade
        const originalLink = links.find(link => link.id === editingId);
        linkData = {
          ...originalLink,
          title: formTitle, // Permitir mudar o título
          visible: formVisible,
          scheduledVisibility: formScheduledVisibility
        };
      } else {
        // MODIFICAÇÃO: Verificar se a data de agendamento já passou
        let effectiveVisible = formVisible;
        let effectiveScheduledVisibility = formScheduledVisibility;
        
        if (!formVisible && formScheduledVisibility) {
          const scheduledTime = new Date(formScheduledVisibility).getTime();
          const now = new Date().getTime();
          
          // Se o horário já passou, tornar visível imediatamente
          if (scheduledTime <= now) {
            console.log("Scheduled time already passed, making link visible immediately");
            effectiveVisible = true;
            effectiveScheduledVisibility = null;
          }
        }
        
        // Para links normais, permitir edição completa
        linkData = {
          id: editingId || `link-${Date.now()}`,
          title: formTitle,
          url: formUrl,
          visible: effectiveVisible,
          order: parseInt(formOrder),
          scheduledVisibility: effectiveScheduledVisibility
        };
      }
      
      let updatedLinks;
      
      if (editingId) {
        // Atualizando link existente
        updatedLinks = links.map(link => 
          link.id === editingId ? linkData : link
        );
      } else {
        // Adicionando novo link
        updatedLinks = [...links, linkData];
      }
      
      // Ordenar os links por ordem
      updatedLinks.sort((a, b) => a.order - b.order);
      
      // Atualizar no Firebase
      await updateHeaderLinks(updatedLinks);
      setLinks(updatedLinks);
      
      alert(`Link ${editingId ? 'atualizado' : 'adicionado'} com sucesso!`);
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar link:', error);
      alert(`Erro ao ${editingId ? 'atualizar' : 'adicionar'} link: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id) => {
    // Não permitir excluir links fixos
    if (fixedLinkIds.includes(id)) {
      alert('Este é um link fixo e não pode ser excluído. Você pode apenas ocultar o link se não quiser exibi-lo.');
      return;
    }
    
    if (!window.confirm('Tem certeza que deseja excluir este link?')) return;
    
    try {
      const updatedLinks = links.filter(link => link.id !== id);
      
      // Reindexar as ordens para evitar problemas
      const reindexedLinks = updatedLinks.map((link, index) => {
        // Manter ordem dos links fixos
        if (fixedLinkIds.includes(link.id)) {
          return link;
        }
        
        // Atualizar ordem dos links personalizados
        return {
          ...link,
          order: index + 2 // +2 para começar após Home e Materiais
        };
      });
      
      // Atualizar no Firebase
      await updateHeaderLinks(reindexedLinks);
      setLinks(reindexedLinks);
      
      alert('Link excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir link:', error);
      alert(`Erro ao excluir link: ${error.message}`);
    }
  };
  
  const handleMoveUp = async (id) => {
    // Não permitir mover links fixos
    if (fixedLinkIds.includes(id)) {
      alert('Este é um link fixo e sua posição não pode ser alterada.');
      return;
    }
    
    const index = links.findIndex(link => link.id === id);
    const prevLink = links[index - 1];
    
    // Não permitir mover para antes dos links fixos
    if (index <= 0 || fixedLinkIds.includes(prevLink.id)) {
      return;
    }
    
    try {
      const updatedLinks = [...links];
      
      // Trocar com o item anterior
      const temp = { ...updatedLinks[index - 1] };
      updatedLinks[index - 1] = { ...updatedLinks[index], order: index - 1 };
      updatedLinks[index] = { ...temp, order: index };
      
      // Atualizar no Firebase
      await updateHeaderLinks(updatedLinks);
      setLinks(updatedLinks);
    } catch (error) {
      console.error('Erro ao reordenar links:', error);
      alert(`Erro ao reordenar links: ${error.message}`);
    }
  };
  
  const handleMoveDown = async (id) => {
    // Não permitir mover links fixos
    if (fixedLinkIds.includes(id)) {
      alert('Este é um link fixo e sua posição não pode ser alterada.');
      return;
    }
    
    const index = links.findIndex(link => link.id === id);
    
    // Não permitir mover para além do último item ou para além do link da IA
    if (index >= links.length - 1 || links[index + 1].id === 'link-ai') {
      return;
    }
    
    try {
      const updatedLinks = [...links];
      
      // Trocar com o próximo item
      const temp = { ...updatedLinks[index + 1] };
      updatedLinks[index + 1] = { ...updatedLinks[index], order: index + 1 };
      updatedLinks[index] = { ...temp, order: index };
      
      // Atualizar no Firebase
      await updateHeaderLinks(updatedLinks);
      setLinks(updatedLinks);
    } catch (error) {
      console.error('Erro ao reordenar links:', error);
      alert(`Erro ao reordenar links: ${error.message}`);
    }
  };
  
  // Função utilitária para formatar a data
  const formatScheduleDate = (dateString) => {
    if (!dateString) return 'Não agendado';
    
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Verificar se um link é fixo
  const isFixedLink = (id) => fixedLinkIds.includes(id);
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para gerenciar os links do cabeçalho.</p>
      </div>
    );
  }
  
  // Filtrar o link da IA para não mostrar na lista de edição
  const displayLinks = links.filter(link => link.id !== 'link-ai');
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Links do Cabeçalho</h3>
        
        <button
          onClick={handleAddClick}
          className="px-3 py-1.5 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Adicionar Link
        </button>
      </div>
      
      {/* Alerta sobre links fixos */}
      <div className="bg-gray-800/50 rounded-md p-4 mb-6 text-sm">
        <h4 className="text-white font-medium mb-1">Links Fixos</h4>
        <p className="text-gray-300">
          Os links "Home" e "Materiais de Apoio" são fixos e não podem ser excluídos ou reordenados.
          Você pode apenas alterar a visibilidade deles se necessário. O botão "Fale com a IA" sempre estará visível.
        </p>
      </div>
      
      {/* Formulário para adicionar/editar link */}
      {showForm && (
        <div className="mb-6 bg-netflix-black p-4 rounded-md border border-gray-700">
          <h4 className="text-white font-medium mb-4">
            {editingId ? 'Editar Link' : 'Novo Link'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Título</label>
              <input 
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: Materiais de Apoio"
                required
              />
            </div>
            
            {!isFixedLink(editingId) && (
              <div>
                <label className="block text-gray-400 text-sm mb-1">URL</label>
                <input 
                  type="text"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  placeholder="Ex: /materiais"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use caminhos relativos (ex: /materiais) ou URLs completas (ex: https://exemplo.com)
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isFixedLink(editingId) && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Posição</label>
                  <input 
                    type="number"
                    min="2" // Começar após os links fixos
                    value={formOrder}
                    onChange={(e) => setFormOrder(e.target.value)}
                    className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ordem de exibição (começa após links fixos)
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Visibilidade</label>
                <div className="flex items-center h-10">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formVisible}
                      onChange={(e) => setFormVisible(e.target.checked)}
                    />
                    <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-green-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-netflix-red">
                      <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${formVisible ? 'right-1' : 'left-1'}`}></div>
                    </div>
                    <span className="ml-3 text-white text-sm">
                      {formVisible ? 'Visível' : 'Invisível'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* NOVA SEÇÃO - Programação de visibilidade */}
            {!formVisible && (
              <div>
                <label className="block text-gray-400 text-sm mb-1">Programar Visibilidade</label>
                <ScheduledUnlockField 
                  scheduledUnlock={formScheduledVisibility}
                  onChange={(date) => setFormScheduledVisibility(date)}
                />
                {formScheduledVisibility && (
                  <p className="text-xs text-green-500 mt-1">
                    O link será exibido automaticamente em: {formatScheduleDate(formScheduledVisibility)}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-4 py-2 ${isSubmitting ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white rounded transition-colors`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : (editingId ? 'Atualizar' : 'Adicionar')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lista de links */}
      {displayLinks.length > 0 ? (
        <div className="space-y-3">
          {displayLinks.map((link) => (
            <div 
              key={link.id} 
              className={`flex items-center justify-between bg-netflix-black p-3 rounded-md border ${
                isFixedLink(link.id) ? 'border-netflix-red/30 bg-netflix-black/80' : 'border-gray-800'
              } hover:border-gray-700 transition-colors`}
            >
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  link.visible ? 'bg-green-900/20' : 'bg-red-900/20'
                } mr-4`}>
                  <svg className={`w-5 h-5 ${link.visible ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {link.visible ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                    )}
                  </svg>
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="text-white font-medium">
                      {link.title}
                    </h4>
                    {isFixedLink(link.id) && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-netflix-red/20 border border-netflix-red/30 rounded-sm text-netflix-red">
                        Fixo
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{link.url}</p>
                  
                  {/* Mostrar informações de agendamento */}
                  {!link.visible && link.scheduledVisibility && (
                    <p className="text-xs text-green-500 mt-1">
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Visibilidade programada: {formatScheduleDate(link.scheduledVisibility)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {!isFixedLink(link.id) && (
                  <>
                    <button 
                      onClick={() => handleMoveUp(link.id)}
                      className={`p-1.5 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors text-gray-300 ${
                        links.indexOf(link) <= 2 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Mover para cima"
                      disabled={links.indexOf(link) <= 2} // Impedir mover para antes dos links fixos
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleMoveDown(link.id)}
                      className="p-1.5 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors text-gray-300"
                      title="Mover para baixo"
                      disabled={links.indexOf(link) === links.length - 2} // -2 porque ignoramos o link da IA
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </>
                )}
                <button 
                  onClick={() => handleEditClick(link)}
                  className="p-1.5 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors text-gray-300"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                {!isFixedLink(link.id) && (
                  <button 
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 bg-gray-700 rounded-full hover:bg-red-600 transition-colors text-gray-300"
                    title="Excluir"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
          </svg>
          <p className="mt-4 text-gray-400">Nenhum link de cabeçalho cadastrado.</p>
          <button
            onClick={handleAddClick}
            className="mt-2 px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Adicionar Link
          </button>
        </div>
      )}
    </div>
  );
};

export default HeaderLinksEditor;