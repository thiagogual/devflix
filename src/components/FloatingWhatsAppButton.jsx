// src/components/FloatingWhatsAppButton.jsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDevflix } from '../contexts/DevflixContext';

const FloatingWhatsAppButton = () => {
  const location = useLocation();
  const { currentDevflix } = useDevflix();
  const [whatsappConfig, setWhatsappConfig] = useState(null);

  // Check if on admin page
  const isAdminPage = location.pathname.includes('/admin');

  useEffect(() => {
    // Set WhatsApp button configuration from DevFlix context
    if (currentDevflix?.homeButtons?.whatsapp) {
      setWhatsappConfig(currentDevflix.homeButtons.whatsapp);
    }
  }, [currentDevflix]);

  // Don't show on admin pages or if the button is not configured/enabled
  if (isAdminPage || !whatsappConfig || !whatsappConfig.enabled || !whatsappConfig.url) {
    return null;
  }

  return (
    <a
      href={`https://go.rodolfomori.com.br/suporte`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-colors duration-300 animate-pulse-subtle"
      aria-label="WhatsApp"
      title={whatsappConfig.text || "Entre em contato via WhatsApp"}
    >
      {/* WhatsApp Icon */}
      <svg 
        className="w-8 h-8" 
        fill="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.3-.77.966-.944 1.164-.175.2-.349.223-.647.075-.3-.15-1.269-.465-2.411-1.485-.897-.8-1.502-1.788-1.674-2.085-.172-.3-.018-.465.13-.61.134-.133.3-.347.448-.522.15-.17.2-.3.3-.498.099-.2.05-.375-.025-.522-.075-.15-.672-1.621-.922-2.22-.24-.6-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.522.074-.797.375-.273.3-1.045 1.019-1.045 2.487 0 1.462 1.069 2.875 1.219 3.074.149.2 2.096 3.2 5.077 4.487.712.3 1.268.48 1.704.625.714.227 1.365.195 1.88.125.57-.075 1.758-.719 2.006-1.413.248-.693.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.422 7.403h-.004a9.87 9.87 0 01-5.032-1.378l-.36-.214-3.742.982.999-3.658-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.993c-.003 5.45-4.437 9.884-9.885 9.884m8.412-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.1.547 4.149 1.588 5.951L0 24l6.304-1.654a11.882 11.882 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" fillRule="evenodd"/>
      </svg>
    </a>
  );
};

export default FloatingWhatsAppButton;