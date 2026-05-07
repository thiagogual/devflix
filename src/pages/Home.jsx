// src/pages/Home.jsx with updated card buttons
import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import CourseCard from '../components/CourseCard';
import PromoBanner from '../components/PromoBanner';
import BackgroundVideo from '../components/BackgroundVideo';
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton';
import InitialBanner from '../components/InitialBanner';
import AboutCourse from '../components/AboutCourse';
import { useDevflix } from '../contexts/DevflixContext';
import VideoSrc from '../assets/devflix.mp4'

// Memoized CourseCard to prevent unnecessary re-renders
const MemoizedCourseCard = memo(CourseCard);

const Home = () => {
  const {
    classes,
    banner,
    bannerEnabled,
    bannerVisible,
    toggleBannerVisibility,
    countdownVisible,
    isLoading,
    error,
    path,
    currentDevflix,
    headerButtonsConfig
  } = useDevflix();

  // Track loading state for video/image resources
  const [resourcesLoading, setResourcesLoading] = useState(true);

  // Uses the path from context to ensure consistency in routes
  const basePath = useMemo(() => path ? `/${path}` : '', [path]);

  // Content padding based on banner/countdown presence
  // Countdown: 115px banner + 64px navbar = 179px mobile, 52px + 64px navbar = 116px desktop
  const contentPaddingTop = useMemo(() => {
    if (countdownVisible) {
      return 'pt-[179px] sm:pt-[116px]';
    }
    return (bannerEnabled && bannerVisible) ? 'pt-[60px]' : 'pt-0';
  }, [bannerEnabled, bannerVisible, countdownVisible]);

  // Home buttons configuration with memoization
  const homeButtons = useMemo(() => currentDevflix?.homeButtons || {
    primary: { text: 'Assistir Agora', url: '' },
    secondary: { text: 'Materiais de Apoio', url: '/materiais', enabled: true },
    whatsapp: { enabled: false, text: 'Entre no Grupo VIP do WhatsApp', url: '' }
  }, [currentDevflix]);

  // Class dates configuration
  const classDates = useMemo(() => currentDevflix?.classDates || null, [currentDevflix]);

  // Optimize resource loading
  useEffect(() => {
    // Only load essential resources first, defer others
    const loadEssentialResources = () => {
      // Mark resources as loaded
      setResourcesLoading(false);
    };

    // Implement a short timeout to ensure UI is responsive
    const timer = setTimeout(loadEssentialResources, 500); // Reduced timeout for better performance

    return () => clearTimeout(timer);
  }, []);

  // Function to determine if a link is external (memoized)
  const isExternalLink = useMemo(() => (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  }, []);

  // Function to format URLs correctly (memoized)
  const formatUrl = useMemo(() => (url) => {
    if (!url) return basePath + '/aula/1'; // Default to first class

    if (isExternalLink(url)) {
      return url;
    } else {
      // For internal URLs, add basePath if needed
      return url.startsWith('/') ? basePath + url : basePath + '/' + url;
    }
  }, [basePath, isExternalLink]);

  // Get video and fallback sources
  const fallbackImageSrc = currentDevflix?.heroImage || '/images/bg-hero.jpg';

  // Show loading state if still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  // Error handling
  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black py-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-netflix-dark p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-netflix-red mb-4">Erro</h1>
            <p className="text-white mb-6">{error}</p>
            <a
              href="/"
              className="btn-primary py-2 px-4 inline-block"
            >
              Voltar
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Get course title/subtitle
  const courseTitle = currentDevflix?.title || 'Missão Programação do Zero';
  const courseSubtitle = currentDevflix?.subtitle || 'Pessoas comuns, insatisfeitas com o caminho tradicional, decidiram aprender programação com Rodolfo Mori para construir a vida que realmente querem';

  return (
    <div className={`min-h-screen ${contentPaddingTop}`}>
      {/* Banner inicial */}
      <InitialBanner
        bannerData={currentDevflix?.initialBanner}
        instancePath={path}
      />

      {/* Banner promocional */}
      <PromoBanner
        banner={banner}
        enabled={bannerEnabled}
        onToggle={toggleBannerVisibility}
      />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton />

      {/* Hero Section with extended background video - containing "Em alta" section */}
      <div className="relative min-h-screen w-full bg-netflix-black">
        <BackgroundVideo
          videoSrc={VideoSrc}
          fallbackImageSrc={fallbackImageSrc}
          overlay={true}
          darken={true}
        >
          {/* Hero Content - reduced height to make room for thumbnails */}
          <div className="flex justify-start sm:justify-end min-h-[70vh] sm:h-[65vh] container-custom flex-col pb-10 pt-4 sm:pt-20">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <span className="inline-block bg-netflix-red px-2 py-1 text-sm font-bold mb-4">SÉRIE</span>

                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4">{courseTitle}</h1>

                <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
                  {courseSubtitle}
                </p>

                <div className="flex flex-wrap gap-4">
                  {/* Primary Button */}
                  <a
                    href={formatUrl(homeButtons.primary.url)}
                    target={isExternalLink(homeButtons.primary.url) ? "_blank" : "_self"}
                    rel={isExternalLink(homeButtons.primary.url) ? "noopener noreferrer" : ""}
                    className="btn-primary py-3 px-8 text-lg flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {homeButtons.primary.text}
                  </a>

                  {/* Secondary Button - Only if enabled */}
                  {homeButtons.secondary.enabled && (
                    <a
                      href={formatUrl(homeButtons.secondary.url)}
                      target={isExternalLink(homeButtons.secondary.url) ? "_blank" : "_self"}
                      rel={isExternalLink(homeButtons.secondary.url) ? "noopener noreferrer" : ""}
                      className="btn-secondary py-3 px-8 text-lg flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {homeButtons.secondary.text}
                    </a>
                  )}

                  {/* WhatsApp Button - Only if enabled */}
                  {homeButtons.whatsapp && homeButtons.whatsapp.enabled && (
                    <a
                      href={homeButtons.whatsapp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-lg rounded flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.3-.77.966-.944 1.164-.175.2-.349.223-.647.075-.3-.15-1.269-.465-2.411-1.485-.897-.8-1.502-1.788-1.674-2.085-.172-.3-.018-.465.13-.61.134-.133.3-.347.448-.522.15-.17.2-.3.3-.498.099-.2.05-.375-.025-.522-.075-.15-.672-1.621-.922-2.22-.24-.6-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.522.074-.797.375-.273.3-1.045 1.019-1.045 2.487 0 1.462 1.069 2.875 1.219 3.074.149.2 2.096 3.2 5.077 4.487.712.3 1.268.48 1.704.625.714.227 1.365.195 1.88.125.57-.075 1.758-.719 2.006-1.413.248-.693.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.422 7.403h-.004a9.87 9.87 0 01-5.032-1.378l-.36-.214-3.742.982.999-3.658-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.993c-.003 5.45-4.437 9.884-9.885 9.884m8.412-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.1.547 4.149 1.588 5.951L0 24l6.304-1.654a11.882 11.882 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" fillRule="evenodd"/>
                      </svg>
                      {homeButtons.whatsapp.text}
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* "Em alta" section now positioned higher with less padding */}
          <div className="relative z-10 -mt-16">
            <section className="pt-2 sm:pt-16 pb-8">
              <div className="container-custom">
                <motion.h2
                  className="section-header mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Em alta
                </motion.h2>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {classes.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.4) }} // Limiting delay
                    >
                      <MemoizedCourseCard
                        course={course}
                        basePath={basePath}
                        classDates={classDates}
                      />
                    </motion.div>
                  ))}
                </div>

                {homeButtons.secondary.enabled && (
                  <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <a
                      href={formatUrl(homeButtons.secondary.url)}
                      target={isExternalLink(homeButtons.secondary.url) ? "_blank" : "_self"}
                      rel={isExternalLink(homeButtons.secondary.url) ? "noopener noreferrer" : ""}
                      className="btn-primary py-3 px-8 text-lg"
                    >
                      {homeButtons.secondary.text}
                    </a>
                  </motion.div>
                )}
              </div>
            </section>
          </div>
        </BackgroundVideo>
      </div>

      {/* Cronograma CTA section - Only visible if cronograma button is enabled */}
      {headerButtonsConfig?.cronograma?.enabled && (
        <section className="py-16 bg-gradient-to-r from-netflix-red to-red-800">
          <div className="container-custom">
            <div className="text-center">
              <motion.h2
                className="text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                📅 Cronograma Completo
              </motion.h2>
              <motion.p
                className="text-xl mb-8 opacity-90"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Veja todas as aulas organizadas por dia da semana
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <a
                  href={`${basePath}/cronograma`}
                  className="inline-flex items-center px-8 py-4 bg-white text-netflix-red font-bold text-lg rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Ver Cronograma Completo
                </a>
              </motion.div>
              <motion.div
                className="mt-6 flex justify-center space-x-4 text-sm opacity-80"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <span>📍 4 Aulas Principais</span>
                <span>⭐ 1 Aula Bônus</span>
                <span>🎯 Horários Detalhados</span>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* About Course component - lazy loaded */}
      <AboutCourse aboutData={currentDevflix?.aboutCourse} homeButtons={homeButtons} basePath={basePath} />
    </div>
  );
};

export default Home;