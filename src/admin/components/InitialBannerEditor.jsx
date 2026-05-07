import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail, isDirectVideoUrl } from '../../utils/videoUtils';

const InitialBannerEditor = () => {
  const { currentDevflix, updateInitialBanner } = useAdmin();
  const navigate = useNavigate();
  const [showInlinePreview, setShowInlinePreview] = useState(false);
  const [bannerData, setBannerData] = useState({
    enabled: false,
    displayMode: 'always',
    visualMode: 'transparent',
    title: '',
    text: '',
    image: '',
    video: '',
    buttonText: '',
    buttonLink: '',
    titleColor: '#ffffff',
    textColor: '#ffffff',
    buttonTextColor: '#ffffff',
    buttonBgColor: '#e50914',
    bgColor: '#000000',
    opacity: 0.9,
    blurAmount: 10
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (currentDevflix?.initialBanner) {
      setBannerData({
        enabled: currentDevflix.initialBanner.enabled || false,
        displayMode: currentDevflix.initialBanner.displayMode || 'always',
        visualMode: currentDevflix.initialBanner.visualMode || 'transparent',
        title: currentDevflix.initialBanner.title || '',
        text: currentDevflix.initialBanner.text || '',
        image: currentDevflix.initialBanner.image || '',
        video: currentDevflix.initialBanner.video || '',
        buttonText: currentDevflix.initialBanner.buttonText || '',
        buttonLink: currentDevflix.initialBanner.buttonLink || '',
        titleColor: currentDevflix.initialBanner.titleColor || '#ffffff',
        textColor: currentDevflix.initialBanner.textColor || '#ffffff',
        buttonTextColor: currentDevflix.initialBanner.buttonTextColor || '#ffffff',
        buttonBgColor: currentDevflix.initialBanner.buttonBgColor || '#e50914',
        bgColor: currentDevflix.initialBanner.bgColor || '#000000',
        opacity: currentDevflix.initialBanner.opacity || 0.9,
        blurAmount: currentDevflix.initialBanner.blurAmount || 10
      });
    }
  }, [currentDevflix]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBannerData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await updateInitialBanner(bannerData);
      setSaveMessage('Banner inicial atualizado com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setSaveMessage('Erro ao salvar o banner inicial.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewNewPage = () => {
    // Encode banner data to URL to preserve it
    const encodedData = encodeURIComponent(JSON.stringify(bannerData));
    const newTab = window.open(`/admin/dev/banner-preview?data=${encodedData}`, '_blank');
    if (!newTab) {
      // Fallback if popup blocked
      navigate(`/admin/dev/banner-preview?data=${encodedData}`);
    }
  };

  const handlePreviewInline = () => {
    setShowInlinePreview(true);
  };

  const clearLocalStorage = () => {
    if (currentDevflix?.path) {
      localStorage.removeItem(`devflix_banner_shown_${currentDevflix.path}`);
      alert('Cache do banner limpo! O banner será exibido novamente.');
    }
  };

  if (!currentDevflix) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Nenhuma instância selecionada</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Configurações do Banner Inicial</h2>

      {/* Enable/Disable */}
      <div className="mb-6">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="enabled"
            checked={bannerData.enabled}
            onChange={handleChange}
            className="w-5 h-5 text-netflix-red focus:ring-netflix-red rounded"
          />
          <span className="text-lg">Ativar Banner Inicial</span>
        </label>
      </div>

      {bannerData.enabled && (
        <>
          {/* Display Mode */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Modo de Exibição</label>
            <select
              name="displayMode"
              value={bannerData.displayMode}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
            >
              <option value="always">Sempre que entrar</option>
              <option value="once">Apenas na primeira vez</option>
            </select>
            {bannerData.displayMode === 'once' && (
              <button
                onClick={clearLocalStorage}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300"
              >
                Limpar cache (para testar novamente)
              </button>
            )}
          </div>

          {/* Visual Mode */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Estilo do Fundo</label>
            <select
              name="visualMode"
              value={bannerData.visualMode}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
            >
              <option value="transparent">Transparente (com opacidade)</option>
              <option value="blur">Fundo desfocado</option>
              <option value="solid">Fundo sólido (100% opaco)</option>
            </select>
            <div className="mt-2 text-xs text-gray-400">
              {bannerData.visualMode === 'transparent' && '• Fundo com cor e opacidade configuráveis'}
              {bannerData.visualMode === 'blur' && '• Fundo da página desfocado (backdrop-filter)'}
              {bannerData.visualMode === 'solid' && '• Fundo completamente opaco'}
            </div>
          </div>

          {/* Blur Amount - Only for blur mode */}
          {bannerData.visualMode === 'blur' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Intensidade do Blur (px)
              </label>
              <input
                type="number"
                name="blurAmount"
                value={bannerData.blurAmount}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-32 px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
              />
              <span className="ml-2 text-sm text-gray-400">
                Recomendado: 5-15px
              </span>
            </div>
          )}

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Título (H1) - Opcional
            </label>
            <input
              type="text"
              name="title"
              value={bannerData.title}
              onChange={handleChange}
              placeholder="Título principal do banner"
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
            />
            <input
              type="color"
              name="titleColor"
              value={bannerData.titleColor}
              onChange={handleChange}
              className="mt-2 h-10 w-20"
              title="Cor do título"
            />
          </div>

          {/* Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Texto Central - Opcional
            </label>
            <textarea
              name="text"
              value={bannerData.text}
              onChange={handleChange}
              placeholder="Texto descritivo do banner"
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
            />
            <input
              type="color"
              name="textColor"
              value={bannerData.textColor}
              onChange={handleChange}
              className="mt-2 h-10 w-20"
              title="Cor do texto"
            />
          </div>

          {/* Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              URL da Imagem - Opcional
            </label>
            <input
              type="text"
              name="image"
              value={bannerData.image}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
            />
            <div className="mt-2 text-xs text-gray-400">
              {bannerData.video ? 
                '• Será usada como thumbnail do vídeo (poster)' :
                '• Será exibida como imagem principal do banner'
              }
            </div>
            {bannerData.image && (
              <img 
                src={bannerData.image} 
                alt="Preview" 
                className="mt-2 h-32 object-cover rounded"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>

          {/* Video */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              URL do Vídeo - Opcional
            </label>
            <input
              type="text"
              name="video"
              value={bannerData.video}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=... ou https://exemplo.com/video.mp4"
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
            />
            <div className="mt-2 text-xs text-gray-400">
              • Suporta YouTube, Vimeo e vídeos diretos (MP4, WebM)
              <br />
              • YouTube: Será incorporado como iframe
              <br />
              • Vídeos diretos: Player HTML5 com controles nativos
            </div>
            {bannerData.video && (
              <div className="mt-2">
                {isYouTubeUrl(bannerData.video) ? (
                  <div className="text-xs text-green-400">
                    ✓ Vídeo do YouTube detectado - Será incorporado como iframe
                  </div>
                ) : isDirectVideoUrl(bannerData.video) ? (
                  <div className="text-xs text-green-400">
                    ✓ Arquivo de vídeo direto detectado - Usará player HTML5
                  </div>
                ) : (
                  <div className="text-xs text-yellow-400">
                    ⚠️ URL não reconhecida - Tentará como vídeo direto
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="mb-6 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Botão CTA (Opcional)</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Texto do Botão</label>
              <input
                type="text"
                name="buttonText"
                value={bannerData.buttonText}
                onChange={handleChange}
                placeholder="Ex: Começar Agora"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Link do Botão</label>
              <input
                type="text"
                name="buttonLink"
                value={bannerData.buttonLink}
                onChange={handleChange}
                placeholder="https://exemplo.com ou /pagina"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div className="flex space-x-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cor do Texto</label>
                <input
                  type="color"
                  name="buttonTextColor"
                  value={bannerData.buttonTextColor}
                  onChange={handleChange}
                  className="h-10 w-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cor do Fundo</label>
                <input
                  type="color"
                  name="buttonBgColor"
                  value={bannerData.buttonBgColor}
                  onChange={handleChange}
                  className="h-10 w-20"
                />
              </div>
            </div>
          </div>

          {/* Background Settings - Conditional */}
          {(bannerData.visualMode === 'transparent' || bannerData.visualMode === 'solid') && (
            <div className="mb-6 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Configurações do Fundo</h3>
              
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cor do Fundo</label>
                  <input
                    type="color"
                    name="bgColor"
                    value={bannerData.bgColor}
                    onChange={handleChange}
                    className="h-10 w-20"
                  />
                </div>
                {bannerData.visualMode === 'transparent' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Opacidade</label>
                    <input
                      type="number"
                      name="opacity"
                      value={bannerData.opacity}
                      onChange={handleChange}
                      min="0"
                      max="1"
                      step="0.1"
                      className="w-20 px-2 py-1 bg-gray-700 rounded"
                    />
                  </div>
                )}
              </div>
              {bannerData.visualMode === 'solid' && (
                <div className="mt-2 text-xs text-gray-400">
                  No modo sólido, o fundo será 100% opaco
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-8">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-netflix-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
        
        {bannerData.enabled && (
          <>
            <button
              onClick={handlePreviewInline}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Preview Rápido
            </button>
            <button
              onClick={handlePreviewNewPage}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Preview em Tela Cheia
            </button>
          </>
        )}
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`mt-4 p-3 rounded-lg ${
          saveMessage.includes('sucesso') ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Inline Preview Modal */}
      <AnimatePresence>
        {showInlinePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            {/* Background Layer - Matching the main component */}
            {bannerData.visualMode === 'blur' ? (
              <div 
                className="absolute inset-0 bg-black/50"
                style={{ 
                  backdropFilter: `blur(${bannerData.blurAmount || 10}px)`,
                  WebkitBackdropFilter: `blur(${bannerData.blurAmount || 10}px)`
                }}
                onClick={() => setShowInlinePreview(false)}
              />
            ) : bannerData.visualMode === 'solid' ? (
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundColor: bannerData.bgColor || '#000000',
                  opacity: 1
                }}
                onClick={() => setShowInlinePreview(false)}
              />
            ) : (
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundColor: bannerData.bgColor || '#000000',
                  opacity: bannerData.opacity || 0.9
                }}
                onClick={() => setShowInlinePreview(false)}
              />
            )}


            {/* Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="relative max-w-4xl mx-auto px-6 text-center z-20"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowInlinePreview(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Fechar preview"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Preview Badge */}
              <div className="absolute -top-16 left-0 bg-blue-600 px-3 py-1 rounded-full text-sm">
                Preview Mode
              </div>

              {/* Image (optional) - Only show if no video */}
              {bannerData.image && !bannerData.video && (
                <div className="mb-8">
                  <img 
                    src={bannerData.image} 
                    alt="Banner" 
                    className="max-w-full h-auto mx-auto rounded-lg shadow-2xl"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}

              {/* Title */}
              {bannerData.title && (
                <h1 
                  className="text-5xl md:text-6xl font-bold mb-6"
                  style={{ color: bannerData.titleColor || '#ffffff' }}
                >
                  {bannerData.title}
                </h1>
              )}

              {/* Video Player (optional) - After title */}
              {bannerData.video && (
                <div className="mb-8">
                  {isYouTubeUrl(bannerData.video) ? (
                    // YouTube embed
                    <div className="relative mx-auto rounded-lg overflow-hidden shadow-2xl" style={{ maxWidth: '560px', aspectRatio: '16/9' }}>
                      <iframe
                        src={getYouTubeEmbedUrl(bannerData.video)}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      ></iframe>
                    </div>
                  ) : isDirectVideoUrl(bannerData.video) ? (
                    // Direct video file
                    <video
                      controls
                      playsInline
                      className="max-w-full h-auto mx-auto rounded-lg shadow-2xl"
                      style={{ maxHeight: '400px' }}
                      poster={bannerData.image || undefined}
                    >
                      <source src={bannerData.video} type="video/mp4" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  ) : (
                    // Fallback
                    <video
                      controls
                      playsInline
                      className="max-w-full h-auto mx-auto rounded-lg shadow-2xl"
                      style={{ maxHeight: '400px' }}
                      poster={bannerData.image || undefined}
                    >
                      <source src={bannerData.video} type="video/mp4" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  )}
                </div>
              )}

              {/* Text */}
              {bannerData.text && (
                <p 
                  className="text-xl md:text-2xl mb-8 leading-relaxed"
                  style={{ color: bannerData.textColor || '#ffffff' }}
                >
                  {bannerData.text}
                </p>
              )}

              {/* CTA Button (optional) */}
              {bannerData.buttonText && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert(`Botão clicado! Link: ${bannerData.buttonLink || 'Sem link'}`)}
                  className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all"
                  style={{
                    backgroundColor: bannerData.buttonBgColor || '#e50914',
                    color: bannerData.buttonTextColor || '#ffffff'
                  }}
                >
                  {bannerData.buttonText}
                </motion.button>
              )}

              {/* Skip Text */}
              <div className="mt-8">
                <button
                  onClick={() => setShowInlinePreview(false)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Pular →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InitialBannerEditor;