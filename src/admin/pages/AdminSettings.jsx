// src/admin/pages/AdminSettings.jsx (updated with PublishStatusEditor)
import { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import PublishStatusEditor from '../components/PublishStatusEditor';

// Formatar data para exibição
const formatDateDisplay = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const options = { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('pt-BR', options);
};

const AdminSettings = () => {
  const { isLoading, currentDevflix, updateDevflixInstance } = useAdmin();
  const [baseUrl, setBaseUrl] = useState('');
  const [mainTitle, setMainTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    // Determinar a URL base do site
    const url = window.location.origin;
    setBaseUrl(url);
  }, []);

  useEffect(() => {
    // Carregar o título principal atual
    if (currentDevflix) {
      setMainTitle(currentDevflix.title || 'Missão Programação do Zero');
    }
  }, [currentDevflix]);
  
  // Efeito para scroll para o topo ao montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  const clearStoredData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados armazenados? Esta ação não pode ser desfeita.')) {
      // Em um ambiente real, aqui faria uma requisição para limpar os dados no servidor
      alert('Funcionalidade ainda não implementada.');
    }
  };
  
  const handleSaveTitle = async () => {
    if (!currentDevflix) return;

    try {
      await updateDevflixInstance(currentDevflix.id, { title: mainTitle });
      setIsEditingTitle(false);
      alert('Título principal atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar o título: ' + error.message);
    }
  };
  
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>
      
      <div className="space-y-8">
        {/* Cronograma das Aulas (somente visualização) */}
        {currentDevflix?.classDates && (
          <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-white mb-4">Cronograma das Aulas</h3>
            <p className="text-gray-400 text-sm mb-4">
              Datas definidas na criação desta DevFlix.
            </p>

            <div className="bg-netflix-black rounded-lg p-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-netflix-red font-medium">Aula 1</span>
                  <span className="text-gray-300 text-sm">{formatDateDisplay(currentDevflix.classDates.aula1)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-netflix-red font-medium">Aula 2</span>
                  <span className="text-gray-300 text-sm">{formatDateDisplay(currentDevflix.classDates.aula2)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-netflix-red font-medium">Aula 3</span>
                  <span className="text-gray-300 text-sm">{formatDateDisplay(currentDevflix.classDates.aula3)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-900/30 rounded border border-yellow-600/30">
                  <span className="text-yellow-500 font-medium">Aula Bônus</span>
                  <span className="text-gray-300 text-sm">{formatDateDisplay(currentDevflix.classDates.aulaBonus)}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <span className="text-netflix-red font-medium">Aula 4</span>
                  <span className="text-gray-300 text-sm">{formatDateDisplay(currentDevflix.classDates.aula4)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Novo componente: Publicação */}
        <PublishStatusEditor />
        
        {/* Personalização */}
        <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-white mb-4">Personalização</h3>
          
          {currentDevflix ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Título Principal</label>
                <p className="text-gray-500 text-xs mb-2">
                  Este é o título que aparece na página inicial do seu DevFlix
                </p>
                {isEditingTitle ? (
                  <div className="space-y-2">
                    <input 
                      type="text"
                      value={mainTitle}
                      onChange={(e) => setMainTitle(e.target.value)}
                      className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                      placeholder="Ex: Missão Programação do Zero"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveTitle}
                        className="px-3 py-1.5 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setMainTitle(currentDevflix.title || 'Missão Programação do Zero');
                          setIsEditingTitle(false);
                        }}
                        className="px-3 py-1.5 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <p className="text-white">{mainTitle}</p>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="p-1 text-gray-400 hover:text-netflix-red transition-colors"
                      title="Editar título"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Selecione uma instância da DevFlix para personalizar.</p>
          )}
        </div>
        
        {/* Links e URLs */}
        <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-white mb-4">Links e URLs</h3>
          
          {currentDevflix ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">URL da Página Principal</label>
                <div className="flex">
                  <input 
                    type="text"
                    value={`${baseUrl}/${currentDevflix.path}`}
                    readOnly
                    className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${baseUrl}/${currentDevflix.path}`)}
                    className="ml-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    title="Copiar URL"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">URL da Página de Materiais</label>
                <div className="flex">
                  <input 
                    type="text"
                    value={`${baseUrl}/${currentDevflix.path}/materiais`}
                    readOnly
                    className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(`${baseUrl}/${currentDevflix.path}/materiais`)}
                    className="ml-2 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    title="Copiar URL"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Status de publicação - informação simples */}
              <div className="bg-netflix-black rounded-md p-4 mt-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${currentDevflix.isPublished !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <p className="text-sm text-gray-300">
                    Status de acesso público: <span className={currentDevflix.isPublished !== false ? 'text-green-400' : 'text-red-400'}>
                      {currentDevflix.isPublished !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Selecione uma instância da DevFlix para ver as URLs.</p>
          )}
        </div>
        
        {/* Dados e Cache */}
        <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-white mb-4">Dados e Cache</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 mb-2">
                Limpar todos os dados armazenados. Esta ação irá redefinir todas as configurações e instâncias.
              </p>
              <button
                onClick={clearStoredData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Limpar Todos os Dados
              </button>
            </div>
          </div>
        </div>
        
        {/* Informações */}
        <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-white mb-4">Informações</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Versão:</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total de instâncias:</span>
              <span className="text-white">{isLoading ? '...' : '2'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;