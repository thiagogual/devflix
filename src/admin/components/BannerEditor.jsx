// src/admin/components/BannerEditor.jsx
import { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import ScheduledUnlockField from './ScheduledUnlockField';

const BannerEditor = () => {
  const { currentDevflix, updateBanner, toggleBanner } = useAdmin();

  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');

  // Estados para cores
  const [backgroundColor, setBackgroundColor] = useState('#ff3f3f');
  const [buttonColor, setButtonColor] = useState('#222222');
  const [titleColor, setTitleColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#ffffff');
  const [buttonTextColor, setButtonTextColor] = useState('#ffffff');

  // Estado para agendamento
  const [scheduledVisibility, setScheduledVisibility] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  // Atualiza o estado com os dados do banner selecionado
  useEffect(() => {
    if (currentDevflix) {
      setEnabled(currentDevflix.bannerEnabled || false);
      setTitle(currentDevflix.banner?.title || '');
      setText(currentDevflix.banner?.text || '');
      setButtonText(currentDevflix.banner?.buttonText || '');
      setButtonLink(currentDevflix.banner?.buttonLink || '');
      setBackgroundColor(currentDevflix.banner?.backgroundColor || '#ff3f3f');
      setButtonColor(currentDevflix.banner?.buttonColor || '#222222');

      // Inicializar cores de texto com valores do banco ou padrões
      setTitleColor(currentDevflix.banner?.titleColor || '#ffffff');
      setTextColor(currentDevflix.banner?.textColor || '#ffffff');
      setButtonTextColor(currentDevflix.banner?.buttonTextColor || '#ffffff');

      // Inicializar agendamento
      setScheduledVisibility(currentDevflix.banner?.scheduledVisibility || null);
    }
  }, [currentDevflix]);

  // O agendamento do banner é gerenciado pelo SchedulerService global (SchedulerChecker).
  // Não precisamos de verificação duplicada aqui.
  
  const handleToggleBanner = async () => {
    try {
      const newValue = !enabled;
      setEnabled(newValue);
      await toggleBanner(newValue);
      
      // Se estiver desativando, limpar qualquer agendamento
      if (!newValue && scheduledVisibility) {
        setScheduledVisibility(null);
        await updateBanner({
          ...currentDevflix.banner,
          scheduledVisibility: null
        });
      }
      
      console.log(`Banner toggled to: ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Erro ao alternar banner:", error);
      // Reverter o estado em caso de erro
      setEnabled(currentDevflix?.bannerEnabled || false);
      alert('Erro ao alternar estado do banner. Tente novamente.');
    }
  };
  
  const handleSave = async () => {
    if (!currentDevflix) return;

    try {
      setIsSaving(true);

      const bannerData = {
        title,
        text,
        buttonText,
        buttonLink,
        backgroundColor,
        buttonColor,
        titleColor,
        textColor,
        buttonTextColor,
        scheduledVisibility
      };

      // Se o horário agendado já passou, ativar imediatamente
      if (scheduledVisibility) {
        const scheduledTime = new Date(scheduledVisibility).getTime();
        const now = new Date().getTime();

        if (scheduledTime <= now) {
          console.log("Scheduled time already passed, enabling banner immediately");
          bannerData.scheduledVisibility = null;
          setScheduledVisibility(null);
          setEnabled(true);
          await updateBanner(bannerData);
          await toggleBanner(true);
          alert('Banner ativado imediatamente (horário agendado já passou).');
          return;
        }
      }

      await updateBanner(bannerData);
      alert('Configurações do banner salvas com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      alert('Erro ao salvar configurações do banner. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Formatar a data de agendamento
  const formatScheduleDate = (dateString) => {
    if (!dateString) return 'Não agendado';
    
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Preview do banner
  const BannerPreview = () => (
    <div 
      className="w-full py-3 px-4 rounded-md flex flex-col space-y-2"
      style={{ backgroundColor }}
    >
      {title && (
        <h1 className="text-lg font-bold" style={{ color: titleColor }}>
          {title}
        </h1>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm font-medium" style={{ color: textColor }}>
          {text || 'Texto do banner'}
        </p>
        <button 
          className="px-4 py-1.5 rounded text-xs font-bold"
          style={{ backgroundColor: buttonColor, color: buttonTextColor }}
        >
          {buttonText || 'Botão'}
        </button>
      </div>
    </div>
  );
  
  if (!currentDevflix) {
    return (
      <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
        <p className="text-gray-400">Selecione uma instância da DevFlix para configurar o banner.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-netflix-dark p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Configuração do Banner</h3>
        
        <div className="flex items-center">
          <span className="text-gray-400 mr-3 text-sm">
            {enabled ? 'Habilitado' : 'Desabilitado'}
          </span>
          <button 
            onClick={handleToggleBanner}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-netflix-red' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">Pré-visualização</label>
        <BannerPreview />
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Título do Banner (H1)</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
            placeholder="Digite o título de destaque do banner (opcional)"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Texto do Banner</label>
          <input 
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
            placeholder="Digite o texto que aparecerá no banner"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Texto do Botão</label>
          <input 
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
            placeholder="Ex: Saiba mais"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Link do Botão</label>
          <input 
            type="url"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
            placeholder="https://exemplo.com/promo"
          />
        </div>
        
        {/* Programação de visibilidade */}
        {!enabled && (
          <div>
            <label className="block text-gray-400 text-sm mb-1">Programar Exibição</label>
            <ScheduledUnlockField 
              scheduledUnlock={scheduledVisibility}
              onChange={(date) => setScheduledVisibility(date)}
            />
            {scheduledVisibility && (
              <p className="text-xs text-green-500 mt-1">
                Banner será exibido automaticamente em: {formatScheduleDate(scheduledVisibility)}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Cor do Fundo</label>
            <div className="flex">
              <input 
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-10 border-0 rounded-l"
              />
              <input 
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-1 flex-1 bg-netflix-black border border-gray-700 rounded-r px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Cor do Botão</label>
            <div className="flex">
              <input 
                type="color"
                value={buttonColor}
                onChange={(e) => setButtonColor(e.target.value)}
                className="h-10 w-10 border-0 rounded-l"
              />
              <input 
                type="text"
                value={buttonColor}
                onChange={(e) => setButtonColor(e.target.value)}
                className="w-1 flex-1 bg-netflix-black border border-gray-700 rounded-r px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Cor do Texto do Botão</label>
            <div className="flex">
              <input 
                type="color"
                value={buttonTextColor}
                onChange={(e) => setButtonTextColor(e.target.value)}
                className="h-10 w-10 border-0 rounded-l"
              />
              <input 
                type="text"
                value={buttonTextColor}
                onChange={(e) => setButtonTextColor(e.target.value)}
                className="w-1 flex-1 bg-netflix-black border border-gray-700 rounded-r px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Cor do Título</label>
            <div className="flex">
              <input 
                type="color"
                value={titleColor}
                onChange={(e) => setTitleColor(e.target.value)}
                className="h-10 w-10 border-0 rounded-l"
              />
              <input 
                type="text"
                value={titleColor}
                onChange={(e) => setTitleColor(e.target.value)}
                className="w-1 flex-1 bg-netflix-black border border-gray-700 rounded-r px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Cor do Texto</label>
            <div className="flex">
              <input 
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-10 w-10 border-0 rounded-l"
              />
              <input 
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-1 flex-1 bg-netflix-black border border-gray-700 rounded-r px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className={`px-4 py-2 ${isSaving ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white rounded transition-colors`}
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
};

export default BannerEditor;