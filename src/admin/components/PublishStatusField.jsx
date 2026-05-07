// src/admin/components/PublishStatusField.jsx
import { useState, useEffect } from 'react';

const PublishStatusField = ({ isPublished, onChange }) => {
  const [published, setPublished] = useState(isPublished);
  
  // Atualizar o estado local quando a prop mudar
  useEffect(() => {
    setPublished(isPublished);
  }, [isPublished]);
  
  const handleToggle = () => {
    const newValue = !published;
    setPublished(newValue);
    onChange(newValue);
  };
  
  return (
    <div className="flex items-center justify-between p-4 bg-netflix-black rounded-lg">
      <div>
        <h4 className="text-white font-medium">Status de Publicação</h4>
        <p className={`text-sm ${published ? 'text-green-500' : 'text-red-500'} mt-1`}>
          {published ? 'Publicado' : 'Não publicado'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {published 
            ? 'Esta DevFlix está acessível ao público.' 
            : 'Esta DevFlix está indisponível para acesso público.'}
        </p>
      </div>
      
      <button 
        onClick={handleToggle}
        className={`px-4 py-2 rounded transition-colors ${
          published 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {published ? 'Despublicar' : 'Publicar'}
      </button>
    </div>
  );
};

export default PublishStatusField;