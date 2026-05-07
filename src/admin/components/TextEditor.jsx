// src/admin/components/TextEditor.jsx
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const TextEditor = () => {
  const { currentDevflix, updateDevflixInstance } = useAdmin();
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para os textos
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  
  // Atualizar estado quando currentDevflix mudar
  useEffect(() => {
    if (currentDevflix) {
      setTitle(currentDevflix.title || 'Missão Programação do Zero');
      setSubtitle(currentDevflix.subtitle || 'Pessoas comuns, insatisfeitas com o caminho tradicional, decidiram aprender programação com Rodolfo Mori para construir a vida que realmente querem');
    }
  }, [currentDevflix]);
  
  const handleSave = async () => {
    if (!currentDevflix) return;
    
    try {
      setIsSaving(true);
      
      // Preparar dados para atualização
      const updateData = {
        title: title.trim(),
        subtitle: subtitle.trim()
      };
      
      // Atualizar no Firebase
      await updateDevflixInstance(currentDevflix.id, updateData);
      
      alert('Textos atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar textos:', error);
      alert(`Erro ao atualizar textos: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleReset = () => {
    if (currentDevflix) {
      setTitle(currentDevflix.title || 'Missão Programação do Zero');
      setSubtitle(currentDevflix.subtitle || 'Pessoas comuns, insatisfeitas com o caminho tradicional, decidiram aprender programação com Rodolfo Mori para construir a vida que realmente querem');
    }
  };
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para editar os textos.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Textos da Página Principal</h3>
      </div>
      
      <div className="space-y-6">
        {/* Título Principal */}
        <div className="bg-netflix-black p-4 rounded-md border border-gray-800">
          <h4 className="text-white font-medium mb-4">Título Principal</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: Missão Programação do Zero"
                maxLength={100}
              />
              <p className="text-gray-500 text-xs mt-1">
                {title.length}/100 caracteres
              </p>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Subtítulo</label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none resize-none"
                placeholder="Ex: Pessoas comuns, insatisfeitas com o caminho tradicional, decidiram aprender programação com Rodolfo Mori para construir a vida que realmente querem"
                rows={3}
                maxLength={300}
              />
              <p className="text-gray-500 text-xs mt-1">
                {subtitle.length}/300 caracteres
              </p>
            </div>
          </div>
        </div>
        
        {/* Preview */}
        <div className="bg-netflix-black p-4 rounded-md border border-gray-800">
          <h4 className="text-white font-medium mb-4">Preview</h4>
          
          <div className="bg-netflix-dark p-4 rounded-md">
            <div className="max-w-3xl">
              <span className="inline-block bg-netflix-red px-2 py-1 text-sm font-bold mb-4">SÉRIE</span>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {title || 'Título não definido'}
              </h1>
              
              <p className="text-lg text-gray-300">
                {subtitle || 'Subtítulo não definido'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            disabled={isSaving}
          >
            Restaurar Padrão
          </button>
          
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded transition-colors ${
              isSaving 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-netflix-red hover:bg-red-700 text-white'
            }`}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditor; 