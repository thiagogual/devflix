// src/components/PromoBanner.jsx (correção espaçamento)
import { useState, useEffect } from 'react';

const PromoBanner = ({ banner, enabled = false, onToggle }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Resetar a visibilidade quando o banner mudar ou for ativado/desativado
  useEffect(() => {
    setIsVisible(true);
  }, [banner, enabled]);

  // Quando o banner é fechado, notifica o componente pai
  const handleClose = () => {
    setIsVisible(false);
    if (onToggle) {
      onToggle(false);
    }
  };
  
  // Se o banner não está habilitado ou não há dados do banner, não mostra nada
  if (!enabled || !isVisible || !banner) return null;
  
  // Valores padrão para caso algum campo esteja faltando
  const {
    title = '', 
    text = 'Bem-vindo à DevFlix!',
    buttonText,
    buttonLink,
    backgroundColor = '#E50914',
    buttonColor = '#141414',
    titleColor = '#ffffff',
    textColor = '#ffffff',
    buttonTextColor = '#ffffff'
  } = banner;
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 w-full z-50 h-[60px] flex items-center" // Altura fixa de 60px e alinhamento vertical centralizado
      style={{ backgroundColor }}
    >
      <div className="container-custom flex flex-col sm:flex-row justify-between items-center h-full">
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center text-left">
          {title && (
            <h1 
              className="text-lg md:text-xl font-bold mr-3"
              style={{ color: titleColor }}
            >
              {title}
            </h1>
          )}
          <p 
            className="text-sm md:text-base font-medium"
            style={{ color: textColor }}
          >
            {text}
          </p>
        </div>
        
        <div className="flex items-center">
          {buttonText && buttonLink && (
            <a 
              href={buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded text-xs font-bold mr-4"
              style={{ 
                backgroundColor: buttonColor,
                color: buttonTextColor
              }}
            >
              {buttonText}
            </a>
          )}
          
          <button 
            onClick={handleClose}
            className="text-white opacity-80 hover:opacity-100"
            title="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;