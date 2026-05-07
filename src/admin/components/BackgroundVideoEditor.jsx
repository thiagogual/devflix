// src/admin/components/BackgroundVideoEditor.jsx
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { getLocalVideos, discoverVideosInDirectory } from '../../services/assetsService';

const BackgroundVideoEditor = () => {
  const { currentDevflix, updateDevflixInstance } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  
  // State for video
  const [backgroundVideo, setBackgroundVideo] = useState('/assets/videos/background.mp4');
  const [videoInputType, setVideoInputType] = useState('file'); // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoAssets, setVideoAssets] = useState([]);
  const [directoryInput, setDirectoryInput] = useState('/assets/videos/');
  const [customDirectory, setCustomDirectory] = useState(false);
  
  // Fetch videos from the assets directory
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoadingVideos(true);
        
        // Get videos from specified directory
        const directory = customDirectory ? directoryInput : '/assets/videos/';
        const videos = await discoverVideosInDirectory(directory);
        
        setVideoAssets(videos);
      } catch (error) {
        console.error("Error discovering videos:", error);
        
        // Fallback to basic detection
        try {
          const localVideos = await getLocalVideos();
          setVideoAssets(localVideos);
        } catch (fallbackError) {
          console.error("Fallback video discovery failed:", fallbackError);
          setVideoAssets([
            { name: 'background.mp4', displayName: 'Background', path: '/assets/videos/background.mp4' }
          ]);
        }
      } finally {
        setIsLoadingVideos(false);
      }
    };
    
    fetchVideos();
  }, [customDirectory, directoryInput]);
  
  // Update state when currentDevflix changes
  useEffect(() => {
    if (currentDevflix && currentDevflix.backgroundVideo) {
      setBackgroundVideo(currentDevflix.backgroundVideo);
      
      // Set input type based on the video path
      const isExternalUrl = 
        currentDevflix.backgroundVideo.startsWith('http://') || 
        currentDevflix.backgroundVideo.startsWith('https://');
      
      setVideoInputType(isExternalUrl ? 'url' : 'file');
      
      if (!isExternalUrl) {
        setSelectedFile(currentDevflix.backgroundVideo);
        
        // Try to determine the directory
        const pathParts = currentDevflix.backgroundVideo.split('/');
        if (pathParts.length > 2) {
          // Remove the filename to get the directory
          pathParts.pop(); 
          const directory = pathParts.join('/') + '/';
          setDirectoryInput(directory);
          
          // If it's not the default directory, set customDirectory to true
          if (directory !== '/assets/videos/') {
            setCustomDirectory(true);
          }
        }
      }
    }
  }, [currentDevflix]);
  
  const handleScan = async () => {
    setIsLoadingVideos(true);
    try {
      const videos = await discoverVideosInDirectory(directoryInput);
      setVideoAssets(videos);
    } catch (error) {
      console.error("Error scanning directory:", error);
      alert("Não foi possível escanear o diretório. Verifique o caminho e tente novamente.");
    } finally {
      setIsLoadingVideos(false);
    }
  };
  
  const handleSave = async () => {
    if (!currentDevflix) return;
    
    try {
      setIsSubmitting(true);
      
      // Determine the video path based on input type
      const videoPath = videoInputType === 'url' 
        ? backgroundVideo 
        : selectedFile;
      
      // Prepare data for update
      const updateData = {
        backgroundVideo: videoPath
      };
      
      // Update in Firebase
      await updateDevflixInstance(currentDevflix.id, updateData);
      
      alert('Vídeo de fundo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar vídeo de fundo:', error);
      alert(`Erro ao atualizar vídeo de fundo: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileSelect = (e) => {
    setSelectedFile(e.target.value);
  };
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para gerenciar o vídeo de fundo.</p>
      </div>
    );
  }
  
  const currentVideo = videoInputType === 'url' ? backgroundVideo : selectedFile;
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Vídeo de Fundo</h3>
      </div>
      
      <div className="space-y-6">
        {/* Video Preview */}
        <div className="relative aspect-video w-full overflow-hidden bg-netflix-black rounded-md">
          <video 
            src={currentVideo}
            className="w-full h-full object-cover"
            autoPlay 
            loop 
            muted 
            playsInline
            controls
          >
            Seu navegador não suporta vídeos HTML5.
          </video>
        </div>
        
        {/* Video Source Selection */}
        <div className="bg-netflix-black p-4 rounded-md border border-gray-800">
          <h4 className="text-white font-medium mb-4">Fonte do Vídeo</h4>
          
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setVideoInputType('file')}
              className={`px-3 py-2 rounded text-sm ${
                videoInputType === 'file' 
                  ? 'bg-netflix-red text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } transition-colors`}
            >
              Escolher Arquivo
            </button>
            <button
              type="button"
              onClick={() => setVideoInputType('url')}
              className={`px-3 py-2 rounded text-sm ${
                videoInputType === 'url' 
                  ? 'bg-netflix-red text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } transition-colors`}
            >
              Usar URL
            </button>
          </div>
          
          {/* File Selection */}
          {videoInputType === 'file' && (
            <div className="space-y-4">
              {/* Directory Selection */}
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="customDirectory"
                  checked={customDirectory}
                  onChange={(e) => setCustomDirectory(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="customDirectory" className="text-gray-400 text-sm">
                  Especificar diretório personalizado
                </label>
              </div>
              
              {customDirectory && (
                <div className="space-y-2">
                  <div className="flex items-stretch">
                    <input 
                      type="text"
                      value={directoryInput}
                      onChange={(e) => setDirectoryInput(e.target.value)}
                      className="flex-1 bg-netflix-dark border border-gray-700 rounded-l px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                      placeholder="/assets/videos/"
                    />
                    <button
                      type="button"
                      onClick={handleScan}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-r flex items-center"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Digite o caminho do diretório e clique no botão de busca para encontrar vídeos.
                  </p>
                </div>
              )}
              
              <label className="block text-gray-400 text-sm mb-1">Selecione um vídeo</label>
              {isLoadingVideos ? (
                <div className="flex items-center space-x-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-netflix-red"></div>
                  <span>Buscando vídeos disponíveis...</span>
                </div>
              ) : (
                <>
                  <select
                    value={selectedFile || ''}
                    onChange={handleFileSelect}
                    className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  >
                    <option value="">-- Selecione um vídeo --</option>
                    {videoAssets.map((asset, index) => (
                      <option key={index} value={asset.path}>
                        {asset.displayName || asset.name}
                      </option>
                    ))}
                  </select>
                  {videoAssets.length === 0 && (
                    <p className="text-yellow-500 text-xs mt-1">
                      Nenhum vídeo encontrado neste diretório. Verifique o caminho ou use uma URL externa.
                    </p>
                  )}
                </>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Escolha um dos vídeos disponíveis nos ativos do site.
              </p>
            </div>
          )}
          
          {/* URL Input */}
          {videoInputType === 'url' && (
            <div className="space-y-4">
              <label className="block text-gray-400 text-sm mb-1">URL do Vídeo</label>
              <input 
                type="text"
                value={backgroundVideo}
                onChange={(e) => setBackgroundVideo(e.target.value)}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: https://exemplo.com/videos/background.mp4"
              />
              <p className="text-xs text-gray-500 mt-1">
                Insira a URL completa do vídeo. Pode ser uma URL externa ou um caminho relativo como "/assets/videos/background.mp4".
              </p>
            </div>
          )}
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

export default BackgroundVideoEditor;