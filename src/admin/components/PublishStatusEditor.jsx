// src/admin/components/PublishStatusEditor.jsx
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const PublishStatusEditor = () => {
  const { currentDevflix, togglePublishStatus } = useAdmin();
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (currentDevflix) {
      setIsPublished(currentDevflix.isPublished !== false); // Default to true if not specified
    }
  }, [currentDevflix]);
  
  const handleTogglePublish = async () => {
    if (!currentDevflix) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const newPublishStatus = !isPublished;
      
      // Confirmar ação se estiver despublicando
      if (!newPublishStatus) {
        if (!window.confirm('Tem certeza que deseja despublicar esta DevFlix? Ela não estará mais acessível ao público.')) {
          setIsSubmitting(false);
          return;
        }
      }
      
      // Toggle publish status in the backend
      await togglePublishStatus(currentDevflix.id, newPublishStatus);
      
      // Update local state
      setIsPublished(newPublishStatus);
      
      // Show success message
      alert(`DevFlix ${newPublishStatus ? 'publicada' : 'despublicada'} com sucesso!`);
      
    } catch (err) {
      console.error('Erro ao alterar status de publicação:', err);
      setError(`Erro ao alterar status de publicação: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para gerenciar o status de publicação.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-white mb-6">Status de Publicação</h3>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-netflix-black p-4 rounded-lg mb-4">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isPublished ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <h4 className="text-lg font-medium text-white">
              {isPublished ? 'DevFlix Publicada' : 'DevFlix Não Publicada'}
            </h4>
          </div>
          <p className={`text-sm mt-1 ${isPublished ? 'text-green-400' : 'text-red-400'}`}>
            {isPublished 
              ? 'Esta DevFlix está acessível publicamente.' 
              : 'Esta DevFlix não está disponível para acesso público.'}
          </p>
        </div>
        
        <button
          onClick={handleTogglePublish}
          disabled={isSubmitting}
          className={`
            px-4 py-2 rounded transition-colors flex items-center
            ${isSubmitting ? 'bg-gray-600 cursor-not-allowed' : ''}
            ${isPublished 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </>
          ) : isPublished ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
              </svg>
              Despublicar
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Publicar
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-gray-800/50 rounded-md p-4 text-sm">
        <h4 className="text-white font-medium mb-1">Importante</h4>
        <ul className="text-gray-300 space-y-2">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              Quando uma DevFlix está <strong className="text-green-400">publicada</strong>, ela pode ser acessada publicamente pela URL.
            </span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              Quando <strong className="text-red-400">não publicada</strong>, os visitantes verão uma mensagem de que a página não está disponível.
            </span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              DevFlix duplicadas são criadas com status <strong className="text-red-400">não publicado</strong> por padrão.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PublishStatusEditor;