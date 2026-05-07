import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail, isDirectVideoUrl } from '../../utils/videoUtils';

const BannerPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerData, setBannerData] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Get banner data from location state or URL params
    if (location.state?.bannerData) {
      setBannerData(location.state.bannerData);
    } else {
      // Try to get from URL params for direct access
      const params = new URLSearchParams(location.search);
      const encodedData = params.get('data');
      if (encodedData) {
        try {
          const decoded = JSON.parse(decodeURIComponent(encodedData));
          setBannerData(decoded);
        } catch (e) {
          console.error('Error decoding banner data:', e);
        }
      }
    }
  }, [location]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      // Close window if opened in new tab, otherwise go back
      if (window.opener) {
        window.close();
      } else {
        navigate(-1);
      }
    }, 300);
  };

  const handleButtonClick = () => {
    if (bannerData?.buttonLink) {
      alert(`Botão clicado! Link: ${bannerData.buttonLink}`);
    }
    handleClose();
  };

  const handleRestart = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsVisible(true);
    }, 500);
  };

  if (!bannerData) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Nenhum banner para visualizar</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700"
          >
            Voltar ao Editor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Preview Controls */}
      <div className="fixed top-4 right-4 z-[10000] flex gap-2">
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
        >
          Reiniciar Preview
        </button>
        <button
          onClick={() => {
            if (window.opener) {
              window.close();
            } else {
              navigate(-1);
            }
          }}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 shadow-lg"
        >
          {window.opener ? 'Fechar Aba' : 'Voltar ao Editor'}
        </button>
      </div>

      {/* Info Box */}
      <div className="fixed bottom-4 left-4 z-[10000] bg-black/80 p-4 rounded-lg max-w-sm">
        <h3 className="text-sm font-bold mb-2 text-white">Modo Preview</h3>
        <p className="text-xs text-gray-300">
          Modo de exibição: {bannerData.displayMode === 'once' ? 'Apenas uma vez' : 'Sempre'}
        </p>
        <p className="text-xs text-gray-300">
          Estilo do fundo: {
            bannerData.visualMode === 'blur' ? 'Desfocado' :
            bannerData.visualMode === 'solid' ? 'Sólido' : 'Transparente'
          }
        </p>
        {bannerData.displayMode === 'once' && (
          <p className="text-xs text-yellow-400 mt-1">
            ℹ️ No modo real, seria salvo no localStorage após fechar
          </p>
        )}
      </div>

      {/* Banner Component */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            {/* Background Layer - Matching modes */}
            {bannerData.visualMode === 'blur' ? (
              <div 
                className="absolute inset-0 bg-black/50"
                style={{ 
                  backdropFilter: `blur(${bannerData.blurAmount || 10}px)`,
                  WebkitBackdropFilter: `blur(${bannerData.blurAmount || 10}px)`
                }}
                onClick={handleClose}
              />
            ) : bannerData.visualMode === 'solid' ? (
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundColor: bannerData.bgColor || '#000000',
                  opacity: 1
                }}
                onClick={handleClose}
              />
            ) : (
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundColor: bannerData.bgColor || '#000000',
                  opacity: bannerData.opacity || 0.9
                }}
                onClick={handleClose}
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
                onClick={handleClose}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Fechar banner"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

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
                        onLoad={() => setIsVideoLoaded(true)}
                        style={{ 
                          opacity: isVideoLoaded ? 1 : 0,
                          transition: 'opacity 0.5s ease-in-out'
                        }}
                      ></iframe>
                    </div>
                  ) : isDirectVideoUrl(bannerData.video) ? (
                    // Direct video file
                    <video
                      controls
                      playsInline
                      onLoadedData={() => setIsVideoLoaded(true)}
                      className="max-w-full h-auto mx-auto rounded-lg shadow-2xl"
                      style={{ 
                        maxHeight: '400px',
                        opacity: isVideoLoaded ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out'
                      }}
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
                      onLoadedData={() => setIsVideoLoaded(true)}
                      className="max-w-full h-auto mx-auto rounded-lg shadow-2xl"
                      style={{ 
                        maxHeight: '400px',
                        opacity: isVideoLoaded ? 1 : 0,
                        transition: 'opacity 0.5s ease-in-out'
                      }}
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
                  onClick={handleButtonClick}
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
                  onClick={handleClose}
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

export default BannerPreview;