// src/pages/Materiais.jsx (updated with WhatsApp button)
import { motion } from 'framer-motion';
import { useDevflix } from '../contexts/DevflixContext';
import PromoBanner from '../components/PromoBanner';
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton';

// Ícones para os diferentes tipos de materiais
const getIcon = (type, locked) => {
  if (locked) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>
    );
  }
  
  switch (type) {
    case 'slides':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      );
    case 'code':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
      );
    case 'exercise':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      );
    case 'doc':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      );
    case 'video':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      );
    case 'link':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
  }
};

const Materiais = () => {
  const {
    classes,
    materials,
    banner,
    bannerEnabled,
    bannerVisible,
    toggleBannerVisibility,
    countdownVisible,
    isLoading,
    error,
    path,
    currentDevflix
  } = useDevflix();

  // Usa o path do contexto para garantir consistência nas rotas
  const basePath = path ? `/${path}` : '';

  // Ajuste para o conteúdo principal baseado na presença do banner/countdown
  // Countdown: 100px mobile + 64px navbar = 164px mobile, 52px + 64px navbar = 116px desktop
  const getContentPadding = () => {
    if (countdownVisible) {
      return 'pt-[164px] sm:pt-[116px]';
    }
    return (bannerEnabled && bannerVisible) ? 'pt-[76px]' : 'pt-16';
  };
  const contentPaddingTop = getContentPadding();
  
  // Formatar os materiais para exibição
  const materiaisAulas = classes.map(classItem => {
    const classMaterials = materials.find(m => m.classId === classItem.id);
    return {
      id: classItem.id,
      title: classItem.title,
      videoLink: classItem.videoLink || '', // Get the videoLink
      links: classMaterials ? classMaterials.items : []
    };
  });
  
  // Function to determine if a link is external
  const isExternalLink = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black py-20">
        <FloatingWhatsAppButton />
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-netflix-dark p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-netflix-red mb-4">Erro ao carregar materiais</h1>
            <p className="text-white mb-6">{error}</p>
            <a 
              href={basePath}
              className="btn-primary py-2 px-4 inline-block"
            >
              Voltar para Home
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-netflix-black ${contentPaddingTop} pb-16`}>
      {/* Banner promocional */}
      <PromoBanner 
        banner={banner} 
        enabled={bannerEnabled} 
        onToggle={toggleBannerVisibility}
      />
      
      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton />
      
      <div className="container-custom pt-24">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-bold">Materiais de Apoio</h1>
            <a 
              href={basePath}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Voltar para Home
            </a>
          </div>
          
          <p className="text-gray-300 mb-8">
            Aqui você encontra todos os materiais de apoio para complementar o seu aprendizado nas aulas do evento.
          </p>
          
          {materiaisAulas.map((aula, index) => (
            <motion.div 
              key={aula.id}
              className="bg-netflix-dark rounded-lg p-6 mb-8 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-netflix-red">{aula.title}</h2>
              
              {aula.links && aula.links.length > 0 ? (
                <ul className="space-y-3">
                  {aula.links.map((link, linkIndex) => (
                    <motion.li 
                      key={linkIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + linkIndex * 0.05 }}
                    >
                      {link.locked ? (
                        <div className="flex items-center p-3 bg-black/30 rounded-md group">
                          <span className="flex items-center justify-center w-10 h-10 bg-red-900/20 rounded-full mr-4 transition-colors">
                            {getIcon(link.type, true)}
                          </span>
                          <span className="flex-1 opacity-70">{link.title}</span>
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                          </svg>
                        </div>
                      ) : (
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-black/30 hover:bg-black/50 rounded-md transition-colors group"
                        >
                          <span className="flex items-center justify-center w-10 h-10 bg-netflix-red/20 group-hover:bg-netflix-red/40 rounded-full mr-4 transition-colors">
                            {getIcon(link.type, false)}
                          </span>
                          <span className="flex-1">{link.title}</span>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-white transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </a>
                      )}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-netflix-red/10 rounded-full mb-4">
                    <svg className="w-8 h-8 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-2">
                    Os materiais desta aula estao a caminho!
                  </p>
                  <p className="text-gray-400 text-sm">
                    Fique atento, conteudos exclusivos serao liberados em breve.
                  </p>
                </div>
              )}
              
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <a 
                  href={aula.videoLink || `${basePath}/aula/${aula.id}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Assistir Aula {aula.id}
                </a>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Materiais;