// src/components/AiChatModal.jsx (aumentado)
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AiChatModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);
  
  // Event listener para fechar modal ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevenir scroll do corpo da página quando o modal estiver aberto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Event listener para tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay/Background */}
          <motion.div 
            className="absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Modal Container - Aumentado em tamanho */}
          <motion.div
            ref={modalRef}
            className="relative bg-netflix-dark rounded-lg overflow-hidden shadow-2xl w-11/12 md:w-5/6 lg:w-10/12 h-[85vh] md:h-[90vh] max-w-6xl z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header do Modal */}
            <div className="flex justify-between items-center p-4 bg-netflix-black border-b border-gray-800">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Assistente DevClub
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Conteúdo do Modal (iframe) */}
            <div className="w-full h-[calc(100%-60px)]">
              <iframe
                src="https://gio.devclub.com.br"
                title="Chat com IA DevClub"
                className="w-full h-full border-0"
                allow="microphone; camera; geolocation"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AiChatModal;