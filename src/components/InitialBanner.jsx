import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isYouTubeUrl, getYouTubeEmbedUrl, getYouTubeThumbnail, isDirectVideoUrl } from '../utils/videoUtils';

const InitialBanner = ({ bannerData, instancePath }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    // Check for preview mode
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('previewBanner');
    if (previewParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(previewParam));
        setPreviewData(decoded);
        setIsVisible(true);
        return;
      } catch (e) {
        console.error('Error parsing preview data:', e);
      }
    }

    if (!bannerData?.enabled) {
      setIsVisible(false);
      return;
    }

    const storageKey = `devflix_banner_shown_${instancePath}`;
    
    if (bannerData.displayMode === 'once') {
      const hasShown = localStorage.getItem(storageKey);
      if (hasShown) {
        setIsVisible(false);
        return;
      }
    }

    setIsVisible(true);
  }, [bannerData, instancePath]);

  const handleClose = () => {
    setIsVisible(false);
    
    // Use previewData if available, otherwise use bannerData
    const data = previewData || bannerData;
    if (data?.displayMode === 'once' && !previewData) {
      const storageKey = `devflix_banner_shown_${instancePath}`;
      localStorage.setItem(storageKey, 'true');
    }
  };

  const handleButtonClick = () => {
    const data = previewData || bannerData;
    if (data?.buttonLink) {
      if (data.buttonLink.startsWith('http')) {
        window.open(data.buttonLink, '_blank');
      } else {
        window.location.href = data.buttonLink;
      }
    }
    handleClose();
  };

  // Use previewData if available, otherwise use bannerData
  const data = previewData || bannerData;
  
  if (!isVisible || (!data?.enabled && !previewData)) return null;

  // Determinar o modo visual (padrão: transparent)
  const visualMode = data?.visualMode || 'transparent';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        {/* Background Layer - Depende do modo visual */}
        {visualMode === 'blur' ? (
          <>
            {/* Blur Background - Captura o conteúdo da página */}
            <div 
              className="absolute inset-0 bg-black/50"
              style={{ 
                backdropFilter: `blur(${data.blurAmount || 10}px)`,
                WebkitBackdropFilter: `blur(${data.blurAmount || 10}px)`
              }}
              onClick={handleClose}
            />
          </>
        ) : visualMode === 'solid' ? (
          /* Solid Background - 100% opaco */
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: data.bgColor || '#000000',
              opacity: 1
            }}
            onClick={handleClose}
          />
        ) : (
          /* Transparent Mode - Modo padrão com opacidade configurável */
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundColor: data.bgColor || '#000000',
              opacity: data.opacity || 0.9
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
          {data.image && !data.video && (
            <div className="mb-8">
              <img 
                src={data.image} 
                alt="Banner" 
                className="max-w-full h-auto mx-auto rounded-lg shadow-2xl"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}

          {/* Title */}
          {data.title && (
            <h1 
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{ color: data.titleColor || '#ffffff' }}
            >
              {data.title}
            </h1>
          )}

          {/* Video Player (optional) - After title */}
          {data.video && (
            <div className="mb-8">
              {isYouTubeUrl(data.video) ? (
                // YouTube embed
                <div className="relative mx-auto rounded-lg overflow-hidden shadow-2xl" style={{ maxWidth: '560px', aspectRatio: '16/9' }}>
                  <iframe
                    src={getYouTubeEmbedUrl(data.video)}
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
              ) : isDirectVideoUrl(data.video) ? (
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
                  poster={data.image || undefined}
                >
                  <source src={data.video} type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              ) : (
                // Fallback for other URLs - try as direct video
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
                  poster={data.image || undefined}
                >
                  <source src={data.video} type="video/mp4" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              )}
            </div>
          )}

          {/* Text */}
          {data.text && (
            <p 
              className="text-xl md:text-2xl mb-8 leading-relaxed"
              style={{ color: data.textColor || '#ffffff' }}
            >
              {data.text}
            </p>
          )}

          {/* CTA Button (optional) */}
          {data.buttonText && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleButtonClick}
              className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all"
              style={{
                backgroundColor: data.buttonBgColor || '#e50914',
                color: data.buttonTextColor || '#ffffff'
              }}
            >
              {data.buttonText}
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
    </AnimatePresence>
  );
};

export default InitialBanner;