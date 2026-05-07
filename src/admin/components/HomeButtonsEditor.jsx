// src/admin/components/HomeButtonsEditor.jsx (updated)
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const HomeButtonsEditor = () => {
  const { currentDevflix, updateHomeButtons } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for main buttons
  const [primaryButton, setPrimaryButton] = useState({
    text: 'Assistir Agora',
    url: ''
  });
  
  const [secondaryButton, setSecondaryButton] = useState({
    enabled: true,
    text: 'Materiais de Apoio',
    url: '/materiais'
  });
  
  // WhatsApp button state
  const [whatsappButton, setWhatsappButton] = useState({
    enabled: false,
    text: 'Entre no Grupo VIP do WhatsApp',
    url: 'https://whatsapp.com/group/link'
  });
  
  // Update state when currentDevflix changes
  useEffect(() => {
    if (currentDevflix && currentDevflix.homeButtons) {
      // Set primary button data
      if (currentDevflix.homeButtons.primary) {
        setPrimaryButton({
          text: currentDevflix.homeButtons.primary.text || 'Assistir Agora',
          url: currentDevflix.homeButtons.primary.url || ''
        });
      }
      
      // Set secondary button data
      if (currentDevflix.homeButtons.secondary) {
        setSecondaryButton({
          enabled: currentDevflix.homeButtons.secondary.enabled !== false, // Default to true if not specified
          text: currentDevflix.homeButtons.secondary.text || 'Materiais de Apoio',
          url: currentDevflix.homeButtons.secondary.url || '/materiais'
        });
      }
      
      // Set WhatsApp button data
      if (currentDevflix.homeButtons.whatsapp) {
        setWhatsappButton({
          enabled: currentDevflix.homeButtons.whatsapp.enabled || false,
          text: currentDevflix.homeButtons.whatsapp.text || 'Entre no Grupo VIP do WhatsApp',
          url: currentDevflix.homeButtons.whatsapp.url || 'https://whatsapp.com/group/link'
        });
      }
    } else {
      // Default values if no data exists
      setPrimaryButton({
        text: 'Assistir Agora',
        url: ''
      });
      
      setSecondaryButton({
        enabled: true,
        text: 'Materiais de Apoio',
        url: '/materiais'
      });
      
      setWhatsappButton({
        enabled: false,
        text: 'Entre no Grupo VIP do WhatsApp',
        url: 'https://whatsapp.com/group/link'
      });
    }
  }, [currentDevflix]);
  
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!currentDevflix) return;
    
    try {
      setIsSubmitting(true);
      
      // Create data object for updating
      const buttonsData = {
        primary: primaryButton,
        secondary: secondaryButton,
        whatsapp: whatsappButton
      };
      
      // Call the API function to update
      await updateHomeButtons(buttonsData);
      
      alert('Configurações de botões salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações de botões:', error);
      alert(`Erro ao salvar configurações: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para configurar os botões.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Configuração dos Botões</h3>
      </div>
      
      <form onSubmit={handleSave} className="space-y-6">
        {/* Primary Button (Assistir Agora) */}
        <div className="bg-netflix-black p-4 rounded-md border border-gray-800">
          <h4 className="text-white font-medium mb-4">Botão Principal (Assistir Agora)</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Texto do Botão</label>
              <input 
                type="text"
                value={primaryButton.text}
                onChange={(e) => setPrimaryButton({...primaryButton, text: e.target.value})}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: Assistir Agora"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">URL do Botão</label>
              <input 
                type="text"
                value={primaryButton.url}
                onChange={(e) => setPrimaryButton({...primaryButton, url: e.target.value})}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: https://exemplo.com/aula"
              />
              <p className="text-xs text-gray-500 mt-1">
                Insira a URL completa para onde o botão deve apontar. Este link será aberto em uma nova aba.
              </p>
            </div>
          </div>
        </div>
        
        {/* Secondary Button (Materiais de Apoio) */}
        <div className="bg-netflix-black p-4 rounded-md border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-medium">Botão Secundário (Materiais de Apoio)</h4>
            
            <div className="flex items-center">
              <span className="text-gray-400 mr-3 text-sm">
                {secondaryButton.enabled ? 'Habilitado' : 'Desabilitado'}
              </span>
              <button 
                type="button"
                onClick={() => setSecondaryButton({...secondaryButton, enabled: !secondaryButton.enabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  secondaryButton.enabled ? 'bg-netflix-red' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    secondaryButton.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Texto do Botão</label>
              <input 
                type="text"
                value={secondaryButton.text}
                onChange={(e) => setSecondaryButton({...secondaryButton, text: e.target.value})}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: Materiais de Apoio"
                disabled={!secondaryButton.enabled}
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">URL do Botão</label>
              <input 
                type="text"
                value={secondaryButton.url}
                onChange={(e) => setSecondaryButton({...secondaryButton, url: e.target.value})}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: /materiais"
                disabled={!secondaryButton.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Para links internos, use caminhos relativos (ex: /materiais). Para links externos, use URLs completas.
              </p>
            </div>
          </div>
        </div>
        
        {/* WhatsApp Button */}
        <div className="bg-netflix-black p-4 rounded-md border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-medium">Botão do WhatsApp</h4>
            
            <div className="flex items-center">
              <span className="text-gray-400 mr-3 text-sm">
                {whatsappButton.enabled ? 'Habilitado' : 'Desabilitado'}
              </span>
              <button 
                type="button"
                onClick={() => setWhatsappButton({...whatsappButton, enabled: !whatsappButton.enabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  whatsappButton.enabled ? 'bg-netflix-red' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    whatsappButton.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Texto do Botão</label>
              <input 
                type="text"
                value={whatsappButton.text}
                onChange={(e) => setWhatsappButton({...whatsappButton, text: e.target.value})}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: Entre no Grupo VIP do WhatsApp"
                disabled={!whatsappButton.enabled}
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Link do WhatsApp</label>
              <input 
                type="text"
                value={whatsappButton.url}
                onChange={(e) => setWhatsappButton({...whatsappButton, url: e.target.value})}
                className="w-full bg-netflix-dark border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="Ex: https://chat.whatsapp.com/..."
                disabled={!whatsappButton.enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Insira o link completo do grupo ou contato do WhatsApp.
              </p>
            </div>
          </div>
        </div>
        
        {/* Preview Section */}
        <div className="bg-netflix-black p-4 rounded-md border border-gray-800">
          <h4 className="text-white font-medium mb-4">Pré-visualização</h4>
          
          <div className="flex flex-wrap gap-4 p-6 bg-netflix-dark/50 rounded-md">
            <button className="btn-primary py-3 px-8 text-lg flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {primaryButton.text || 'Assistir Agora'}
            </button>
            
            {secondaryButton.enabled && (
              <button className="btn-secondary py-3 px-8 text-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {secondaryButton.text || 'Materiais de Apoio'}
              </button>
            )}
            
            {whatsappButton.enabled && (
              <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 text-lg rounded flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.3-.77.966-.944 1.164-.175.2-.349.223-.647.075-.3-.15-1.269-.465-2.411-1.485-.897-.8-1.502-1.788-1.674-2.085-.172-.3-.018-.465.13-.61.134-.133.3-.347.448-.522.15-.17.2-.3.3-.498.099-.2.05-.375-.025-.522-.075-.15-.672-1.621-.922-2.22-.24-.6-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.522.074-.797.375-.273.3-1.045 1.019-1.045 2.487 0 1.462 1.069 2.875 1.219 3.074.149.2 2.096 3.2 5.077 4.487.712.3 1.268.48 1.704.625.714.227 1.365.195 1.88.125.57-.075 1.758-.719 2.006-1.413.248-.693.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.422 7.403h-.004a9.87 9.87 0 01-5.032-1.378l-.36-.214-3.742.982.999-3.658-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.993c-.003 5.45-4.437 9.884-9.885 9.884m8.412-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.1.547 4.149 1.588 5.951L0 24l6.304-1.654a11.882 11.882 0 005.684 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" fillRule="evenodd"/>
                </svg>
                {whatsappButton.text || 'Entre no Grupo VIP do WhatsApp'}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 ${isSubmitting ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white rounded transition-colors`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomeButtonsEditor;