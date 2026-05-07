// src/admin/components/CourseImagesEditor.jsx (updated)
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const CourseImagesEditor = () => {
  const { currentDevflix, updateDevflixInstance } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for images
  const [courseImages, setCourseImages] = useState([]);
  
  // Update state when currentDevflix changes
  useEffect(() => {
    if (currentDevflix) {
      // Set course images from classes
      if (currentDevflix.classes && currentDevflix.classes.length > 0) {
        const images = currentDevflix.classes.map(course => ({
          id: course.id,
          title: course.title,
          image: course.coverImage || `/images/aula${course.id}.jpg`
        }));
        setCourseImages(images);
      }
    }
  }, [currentDevflix]);
  
  const handleSave = async () => {
    if (!currentDevflix) return;
    
    try {
      setIsSubmitting(true);
      
      // Update classes with new images
      const updatedClasses = currentDevflix.classes.map(course => {
        const courseImage = courseImages.find(img => img.id === course.id);
        return {
          ...course,
          coverImage: courseImage ? courseImage.image : course.coverImage
        };
      });
      
      // Prepare data for update
      const updateData = {
        classes: updatedClasses
      };
      
      // Update in Firebase
      await updateDevflixInstance(currentDevflix.id, updateData);
      
      alert('Imagens atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar imagens:', error);
      alert(`Erro ao atualizar imagens: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCourseImageChange = (id, newImage) => {
    setCourseImages(prev => 
      prev.map(course => 
        course.id === id ? { ...course, image: newImage } : course
      )
    );
  };
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para gerenciar as imagens.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Imagens das Aulas</h3>
      </div>
      
      <div className="space-y-6">
        {/* Course Images */}
        <div className="bg-netflix-black p-4 rounded-md border border-gray-800">
          <h4 className="text-white font-medium mb-4">Thumbnails das Aulas</h4>
          
          <div className="space-y-4">
            {courseImages.map((course) => (
              <div key={course.id} className="flex flex-col md:flex-row gap-4 py-3 border-t border-gray-700">
                <div className="md:w-1/4">
                  <div className="bg-netflix-black p-2 rounded border border-gray-700 aspect-video">
                    <img 
                      src={course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                </div>
                
                <div className="md:w-3/4">
                  <h5 className="text-white font-medium mb-2">{course.title}</h5>
                  
                  <label className="block text-gray-400 text-sm mb-1">URL da Imagem</label>
                  <input 
                    type="text"
                    value={course.image}
                    onChange={(e) => handleCourseImageChange(course.id, e.target.value)}
                    className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                    placeholder={`Ex: /images/aula${course.id}.jpg`}
                  />
                  
                  <div className="flex mt-4">
                    <button
                      type="button"
                      onClick={() => handleCourseImageChange(course.id, `/images/aula${course.id}.jpg`)}
                      className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                    >
                      Restaurar Padrão
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`px-4 py-2 ${isSubmitting ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white rounded transition-colors`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseImagesEditor;