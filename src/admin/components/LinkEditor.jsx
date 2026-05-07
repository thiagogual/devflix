// src/admin/components/LinkEditor.jsx (correção)
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const LinkEditor = () => {
  const { currentDevflix, updateClass } = useAdmin();
  const [classes, setClasses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para o formulário
  const [formTitle, setFormTitle] = useState('');
  const [formVideoLink, setFormVideoLink] = useState('');
  
  useEffect(() => {
    if (currentDevflix) {
      setClasses(currentDevflix.classes);
    }
  }, [currentDevflix]);
  
  const handleEditClick = (classItem) => {
    setEditingId(classItem.id);
    setFormTitle(classItem.title);
    setFormVideoLink(classItem.videoLink || '');
  };
  
  const handleSave = async () => {
    if (!currentDevflix) return;
    
    try {
      setIsSaving(true);
      
      // Validar URL do vídeo
      let validatedVideoLink = formVideoLink;
      if (validatedVideoLink && !validatedVideoLink.startsWith('http')) {
        validatedVideoLink = 'https://' + validatedVideoLink;
      }
      
      // Atualizar no Firebase
      await updateClass(editingId, {
        title: formTitle,
        videoLink: validatedVideoLink
      });
      
      // Atualizar estado local
      setClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === editingId 
            ? { ...cls, title: formTitle, videoLink: validatedVideoLink } 
            : cls
        )
      );
      
      setEditingId(null);
      setFormTitle('');
      setFormVideoLink('');
      
      alert('Aula atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar aula:', error);
      alert(`Erro ao atualizar aula: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setFormTitle('');
    setFormVideoLink('');
  };
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para editar os links das aulas.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-white mb-6">Links das Aulas</h3>
      
      <div className="space-y-4">
        {classes.map((classItem) => (
          <div 
            key={classItem.id}
            className="bg-netflix-black p-4 rounded-md border border-gray-800"
          >
            {editingId === classItem.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Título da Aula</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Link do Vídeo</label>
                  <input
                    type="url"
                    value={formVideoLink}
                    onChange={(e) => setFormVideoLink(e.target.value)}
                    className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                    placeholder="https://exemplo.com/video"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className={`px-3 py-1.5 ${isSaving ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white text-sm rounded transition-colors`}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium">{classItem.title}</h4>
                  <div className="flex items-center mt-1">
                    <svg className="w-4 h-4 text-netflix-red mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                    </svg>
                    {classItem.videoLink ? (
                      <a 
                        href={classItem.videoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 text-sm hover:text-netflix-red truncate max-w-md"
                      >
                        {classItem.videoLink}
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm italic">Link não definido</span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => handleEditClick(classItem)}
                  className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                  Editar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LinkEditor;