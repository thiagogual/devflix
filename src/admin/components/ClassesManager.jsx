// src/admin/components/ClassesManager.jsx
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const ClassesManager = () => {
  const { currentDevflix, updateDevflixInstance } = useAdmin();
  const [classes, setClasses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Estado para o formulário
  const [formTitle, setFormTitle] = useState('');
  const [formVideoLink, setFormVideoLink] = useState('');
  const [formCoverImage, setFormCoverImage] = useState('');
  
  useEffect(() => {
    if (currentDevflix) {
      setClasses(currentDevflix.classes || []);
    }
  }, [currentDevflix]);
  
  const handleAddClass = () => {
    const newId = (classes.length + 1).toString();
    const newClass = {
      id: newId,
      title: `Aula ${newId}`,
      coverImage: `/images/aula${newId}.jpg`,
      videoLink: ''
    };
    
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    handleSaveClasses(updatedClasses);
  };
  
  const handleRemoveClass = (classId) => {
    if (classes.length <= 1) {
      alert('É necessário ter pelo menos uma aula.');
      return;
    }
    
    if (confirm('Tem certeza que deseja remover esta aula? Esta ação não pode ser desfeita.')) {
      const updatedClasses = classes.filter(cls => cls.id !== classId);
      
      // Reordenar IDs para manter sequência
      const reorderedClasses = updatedClasses.map((cls, index) => ({
        ...cls,
        id: (index + 1).toString()
      }));
      
      setClasses(reorderedClasses);
      handleSaveClasses(reorderedClasses);
    }
  };
  
  const handleEditClick = (classItem) => {
    setEditingId(classItem.id);
    setFormTitle(classItem.title);
    setFormVideoLink(classItem.videoLink || '');
    setFormCoverImage(classItem.coverImage || '');
  };
  
  const handleSaveEdit = () => {
    if (!editingId) return;
    
    const updatedClasses = classes.map(cls => 
      cls.id === editingId 
        ? { 
            ...cls, 
            title: formTitle, 
            videoLink: formVideoLink,
            coverImage: formCoverImage
          } 
        : cls
    );
    
    setClasses(updatedClasses);
    handleSaveClasses(updatedClasses);
    
    setEditingId(null);
    setFormTitle('');
    setFormVideoLink('');
    setFormCoverImage('');
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormTitle('');
    setFormVideoLink('');
    setFormCoverImage('');
  };
  
  const handleSaveClasses = async (classesToSave) => {
    if (!currentDevflix) return;
    
    try {
      setIsSaving(true);
      
      // Atualizar no Firebase
      await updateDevflixInstance(currentDevflix.id, {
        classes: classesToSave
      });
      
      alert('Aulas atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar aulas:', error);
      alert(`Erro ao atualizar aulas: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const moveClass = (fromIndex, toIndex) => {
    const updatedClasses = [...classes];
    const [movedClass] = updatedClasses.splice(fromIndex, 1);
    updatedClasses.splice(toIndex, 0, movedClass);
    
    // Reordenar IDs para manter sequência
    const reorderedClasses = updatedClasses.map((cls, index) => ({
      ...cls,
      id: (index + 1).toString()
    }));
    
    setClasses(reorderedClasses);
    handleSaveClasses(reorderedClasses);
  };
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para gerenciar as aulas.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Gerenciar Aulas</h3>
        <div className="flex items-center space-x-3">
          <span className="text-gray-400 text-sm">
            Total: {classes.length} aula{classes.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={handleAddClass}
            className="px-3 py-1.5 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors flex items-center"
            disabled={isSaving}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Adicionar Aula
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {classes.map((classItem, index) => (
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
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">URL da Imagem de Capa</label>
                  <input
                    type="text"
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                    placeholder={`/images/aula${classItem.id}.jpg`}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className={`px-3 py-1.5 ${isSaving ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white text-sm rounded transition-colors`}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveClass(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => moveClass(index, Math.min(classes.length - 1, index + 1))}
                      disabled={index === classes.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>
                  
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
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditClick(classItem)}
                    className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors flex items-center"
                    disabled={isSaving}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    Editar
                  </button>
                  
                  <button
                    onClick={() => handleRemoveClass(classItem.id)}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center"
                    disabled={isSaving || classes.length <= 1}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Remover
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {classes.length === 0 && (
        <div className="text-center py-10">
          <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
          <p className="mt-4 text-gray-400">Nenhuma aula encontrada.</p>
          <button
            onClick={handleAddClass}
            className="mt-2 px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors"
            disabled={isSaving}
          >
            Adicionar Primeira Aula
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassesManager; 