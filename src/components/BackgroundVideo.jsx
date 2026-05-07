// src/components/BackgroundVideo.jsx - Optimized version
import { useEffect, useRef, useState } from 'react';

const BackgroundVideo = ({ videoSrc, fallbackImageSrc, children, overlay = true, darken = true }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVideoStarted, setIsVideoStarted] = useState(false);

  // Load video only after component mounts to prevent initial loading delay
  useEffect(() => {
    let videoElement = null;
    
    // Small delay to ensure page renders first
    const loadVideoTimer = setTimeout(() => {
      videoElement = videoRef.current;
      
      if (!videoElement) return;
      
      // Add event listeners
      const handleCanPlay = () => {
        setIsLoaded(true);
      };
      
      const handlePlaying = () => {
        setIsVideoStarted(true);
      };
      
      const handleError = (e) => {
        console.error("Error loading video:", e);
        setHasError(true);
      };
      
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('playing', handlePlaying);
      videoElement.addEventListener('error', handleError);
      
      // Set source after events to avoid blocking page load
      if (videoElement.getAttribute('data-src')) {
        videoElement.src = videoElement.getAttribute('data-src');
        videoElement.load();
      }
      
      return () => {
        if (videoElement) {
          videoElement.removeEventListener('canplay', handleCanPlay);
          videoElement.removeEventListener('playing', handlePlaying);
          videoElement.removeEventListener('error', handleError);
        }
      };
    }, 500); // Delay video loading by 500ms
    
    return () => {
      clearTimeout(loadVideoTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Fallback image shown while video loads or if there's an error */}
      {(!isVideoStarted || hasError) && fallbackImageSrc && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{ 
            backgroundImage: `url('${fallbackImageSrc}')`, 
            opacity: 1
          }}
        />
      )}
      
      {/* Video background - using data-src to defer loading */}
      {!hasError && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isVideoStarted ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          playsInline
          loop
          data-src={videoSrc}
          preload="none"
        >
          {/* No source here - will be set via JS after component mounts */}
        </video>
      )}
      
      {/* Gradient overlay for better content visibility */}
      {overlay && (
        <div className={`absolute inset-0 ${darken ? 'bg-gradient-to-r from-netflix-black via-netflix-black/70 to-transparent' : ''}`}></div>
      )}
      
      {/* Additional vertical gradient for text readability */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/40 to-transparent"></div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

export default BackgroundVideo;