// src/admin/pages/AdminSettings.jsx (updated)
import { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const AdminSettings = () => {
  const { isLoading, currentDevflix, updateDevflixInstance } = useAdmin();
  
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
  
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-white mb-6">Configurações</h2>
      
      <div className="space-y-8">
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