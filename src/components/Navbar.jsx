// src/components/Navbar.jsx (updated with Nossos Alunos button)
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevflix } from '../contexts/DevflixContext';
import AiChatModal from './AiChatModal';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const location = useLocation();
  
  // Obtém informações do contexto DevFlix
  const { bannerEnabled, bannerVisible, countdownVisible, currentDevflix, headerButtonsConfig } = useDevflix();

  // Obter links do header dinamicamente
  const headerLinks = currentDevflix?.headerLinks || [];

  // Filtrar apenas links visíveis que não sejam os fixos
  const visibleCustomLinks = headerLinks.filter(link =>
    link.visible &&
    link.id !== 'link-home' &&
    link.id !== 'link-materials' &&
    link.id !== 'link-ai'
  ).sort((a, b) => a.order - b.order);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Função para abrir/fechar o modal da IA
  const toggleAiModal = () => {
    setAiModalOpen(!aiModalOpen);
  };

  // Extrair o path da URL para manter consistência nas rotas
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const basePath = pathSegments.length > 0 ? `/${pathSegments[0]}` : '';

  // Ajustar posição do navbar baseado na presença dos banners
  // Countdown banner: ~52px desktop, ~115px mobile (flex-col com 3 linhas: texto + timer + botão)
  const getNavbarPosition = () => {
    if (countdownVisible) {
      return 'top-[115px] sm:top-[52px]';
    }
    if (bannerEnabled && bannerVisible) {
      return 'top-[60px]';
    }
    return 'top-0';
  };
  const navbarPosition = getNavbarPosition();
  
  // Função para renderizar links personalizados
  const renderCustomLinks = (isMobile = false) => {
    return visibleCustomLinks.map(link => {
      // Determinar se o link é externo
      const isExternal = link.url.startsWith('http');
      
      // Se a URL começa com /, e não com //, mantém o caminho relativo
      // caso contrário, adiciona o basePath no início
      const finalUrl = link.url.startsWith('/') && !link.url.startsWith('//') 
        ? (link.url === '/' ? basePath : `${basePath}${link.url}`)
        : link.url;
      
      // Verificar se o link está ativo
      const isActive = link.url === '/' 
        ? location.pathname === basePath
        : location.pathname.includes(link.url);
      
      if (isExternal) {
        return (
          <a 
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:text-netflix-red transition-colors ${
              isMobile ? 'block py-2' : ''
            } text-white`}
            onClick={isMobile ? () => setMenuOpen(false) : undefined}
          >
            {link.title}
          </a>
        );
      }
      
      return (
        <Link 
          key={link.id}
          to={finalUrl}
          className={`hover:text-netflix-red transition-colors ${
            isActive ? 'text-netflix-red font-medium' : 'text-white'
          } ${isMobile ? 'block py-2' : ''}`}
          onClick={isMobile ? () => setMenuOpen(false) : undefined}
        >
          {link.title}
        </Link>
      );
    });
  };
  
  // Verificar se link está fixo ou não
  const isHomeLinkActive = location.pathname === basePath;
  const isMaterialsLinkActive = location.pathname.includes('/materiais');
  const isCronogramaLinkActive = location.pathname.includes('/cronograma');
  const isAquecimentoLinkActive = location.pathname.includes('/aquecimento');
  
  return (
    <>
      <motion.nav 
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${navbarPosition} ${
          scrolled ? 'bg-netflix-black/90 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-custom h-16 flex justify-between items-center">
          {/* Logo with gradient */}
          <Link to={basePath} className="flex items-center group">
            <span
              className="font-display font-bold text-3xl tracking-tight transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #E50914 0%, #ff4d4d 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              DEV
            </span>
            <span className="font-display font-bold text-3xl tracking-tight text-white group-hover:text-gray-200 transition-colors">
              FLIX
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Home Link */}
            {headerButtonsConfig?.home?.enabled && (
              <Link 
                to={basePath} 
                className={`hover:text-netflix-red transition-colors ${
                  isHomeLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                }`}
              >
                {headerButtonsConfig.home.label}
              </Link>
            )}
            
            {/* Materiais Link */}
            {headerButtonsConfig?.materiais?.enabled && (
              <Link 
                to={`${basePath}/materiais`} 
                className={`hover:text-netflix-red transition-colors ${
                  isMaterialsLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                }`}
              >
                {headerButtonsConfig.materiais.label}
              </Link>
            )}
            
            {/* Cronograma Link */}
            {headerButtonsConfig?.cronograma?.enabled && (
              <Link
                to={`${basePath}/cronograma`}
                className={`hover:text-netflix-red transition-colors ${
                  isCronogramaLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                }`}
              >
                {headerButtonsConfig.cronograma.label}
              </Link>
            )}

            {/* Aquecimento Link */}
            {headerButtonsConfig?.aquecimento?.enabled && (
              <Link
                to={`${basePath}/aquecimento`}
                className={`hover:text-netflix-red transition-colors ${
                  isAquecimentoLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                }`}
              >
                {headerButtonsConfig.aquecimento.label}
              </Link>
            )}

            {/* Links personalizados */}
            {renderCustomLinks()}
            
            {/* Botão "Nossos Alunos" - Premium Style */}
            {headerButtonsConfig?.nossosAlunos?.enabled && (
              <a
                href={headerButtonsConfig.nossosAlunos.url || "https://stars.devclub.com.br"}
                target="_blank"
                rel="noopener noreferrer"
                className="relative py-2 px-5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 overflow-hidden group"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#E50914',
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)',
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <svg className="w-4 h-4 relative z-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                <span className="relative z-10">{headerButtonsConfig.nossosAlunos.label}</span>
              </a>
            )}

            {/* Botão de chat com IA - Premium Gradient */}
            {headerButtonsConfig?.aiChat?.enabled && (
              <button
                onClick={toggleAiModal}
                className="relative py-2 px-5 rounded-xl font-semibold text-sm text-white transition-all duration-300 flex items-center gap-2 overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #E50914 0%, #ff4d4d 50%, #f97316 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 4px 15px rgba(229, 9, 20, 0.4)',
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <span className="relative z-10">{headerButtonsConfig.aiChat.label}</span>
              </button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Botão de Nossos Alunos para mobile */}
            {headerButtonsConfig?.nossosAlunos?.enabled && (
              <a
                href={headerButtonsConfig.nossosAlunos.url || "https://stars.devclub.com.br"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-200 text-netflix-red p-1.5 rounded-md transition-colors"
                aria-label={headerButtonsConfig.nossosAlunos.label}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
              </a>
            )}
          
            {/* Botão de IA para mobile */}
            {headerButtonsConfig?.aiChat?.enabled && (
              <button
                onClick={toggleAiModal}
                className="bg-netflix-red hover:bg-red-700 text-white p-1.5 rounded-md transition-colors"
                aria-label={headerButtonsConfig.aiChat.label}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </button>
            )}
            
            <button 
              className="text-white focus:outline-none"
              onClick={toggleMenu}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="md:hidden absolute top-full left-0 right-0 bg-netflix-black shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container-custom py-4 space-y-4">
                {/* Home Link para mobile */}
                {headerButtonsConfig?.home?.enabled && (
                  <Link 
                    to={basePath} 
                    className={`block py-2 ${
                      isHomeLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {headerButtonsConfig.home.label}
                  </Link>
                )}
                
                {/* Materiais Link para mobile */}
                {headerButtonsConfig?.materiais?.enabled && (
                  <Link 
                    to={`${basePath}/materiais`} 
                    className={`block py-2 ${
                      isMaterialsLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {headerButtonsConfig.materiais.label}
                  </Link>
                )}
                
                {/* Cronograma Link para mobile */}
                {headerButtonsConfig?.cronograma?.enabled && (
                  <Link
                    to={`${basePath}/cronograma`}
                    className={`block py-2 ${
                      isCronogramaLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {headerButtonsConfig.cronograma.label}
                  </Link>
                )}

                {/* Aquecimento Link para mobile */}
                {headerButtonsConfig?.aquecimento?.enabled && (
                  <Link
                    to={`${basePath}/aquecimento`}
                    className={`block py-2 ${
                      isAquecimentoLinkActive ? 'text-netflix-red font-medium' : 'text-white'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {headerButtonsConfig.aquecimento.label}
                  </Link>
                )}

                {/* Links personalizados para mobile */}
                {renderCustomLinks(true)}
                
                {/* Nossos Alunos no menu mobile */}
                {headerButtonsConfig?.nossosAlunos?.enabled && (
                  <a 
                    href={headerButtonsConfig.nossosAlunos.url || "https://stars.devclub.com.br"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-2 text-white hover:text-netflix-red transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {headerButtonsConfig.nossosAlunos.label}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      {/* Modal de Chat com IA */}
      <AiChatModal isOpen={aiModalOpen} onClose={toggleAiModal} />
    </>
  );
};

export default Navbar;