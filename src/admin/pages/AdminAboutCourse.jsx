import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import { getAboutCourse, updateAboutCourse } from '../../firebase/firebaseService';

const AdminAboutCourse = () => {
  const { selectedInstance } = useAdmin();
  const [aboutData, setAboutData] = useState({
    courseTitle: 'Sobre o curso',
    courseDescription: '',
    additionalDescription: '',
    whatsappCardTitle: 'Entre no Grupo VIP do Whatsapp',
    whatsappCardDescription: '',
    materialsCardTitle: 'Materiais Exclusivos',
    materialsCardDescription: '',
    instructorImage: '/assets/instrutor.png',
    instructorName: 'Rodolfo Mori',
    instructorTitle: 'Programador Sênior',
    instructorBio: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [useDefault, setUseDefault] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (selectedInstance) {
      loadAboutData();
    } else {
      setIsLoading(false);
    }
  }, [selectedInstance]);

  const loadAboutData = async () => {
    try {
      setIsLoading(true);
      const data = await getAboutCourse(selectedInstance);
      if (data) {
        setAboutData(prev => ({ ...prev, ...data }));
        setUseDefault(false);
      } else {
        setUseDefault(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados sobre o curso:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar dados sobre o curso' });
      setUseDefault(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setAboutData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset image error when changing instructor image
    if (field === 'instructorImage') {
      setImageError(false);
    }
  };

  const handleSave = async () => {
    if (!selectedInstance) {
      setMessage({ type: 'error', text: 'Nenhuma instância selecionada' });
      return;
    }

    try {
      setIsSaving(true);
      if (useDefault) {
        // Se usar padrão, salva null para remover dados customizados
        await updateAboutCourse(selectedInstance, null);
        setMessage({ type: 'success', text: 'Configuração padrão aplicada com sucesso!' });
      } else {
        await updateAboutCourse(selectedInstance, aboutData);
        setMessage({ type: 'success', text: 'Dados sobre o curso salvos com sucesso!' });
      }
    } catch (error) {
      console.error('Erro ao salvar dados sobre o curso:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar dados sobre o curso' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseDefaultToggle = () => {
    setUseDefault(!useDefault);
    if (!useDefault) {
      // Resetar para valores padrão
      setAboutData({
        courseTitle: 'Sobre o curso',
        courseDescription: '',
        additionalDescription: '',
        whatsappCardTitle: 'Entre no Grupo VIP do Whatsapp',
        whatsappCardDescription: '',
        materialsCardTitle: 'Materiais Exclusivos',
        materialsCardDescription: '',
        instructorImage: '/assets/instrutor.png',
        instructorName: 'Rodolfo Mori',
        instructorTitle: 'Programador Sênior',
        instructorBio: ''
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Sobre o Curso</h1>
          <p className="text-gray-400 mt-2">
            Configure as informações sobre o curso e instrutor
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {/* Toggle Usar Padrão */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useDefault}
                onChange={handleUseDefaultToggle}
                className="sr-only"
              />
              <div className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${useDefault ? 'bg-netflix-red' : 'bg-gray-600'}`}>
                <div className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform ${useDefault ? 'translate-x-6' : 'translate-x-1'} mt-1`}></div>
              </div>
              <span className="ml-3 text-sm font-medium text-white">Usar configuração padrão</span>
            </label>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedInstance}
            className="btn-primary px-6 py-2 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : useDefault ? 'Aplicar Padrão' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.text}
        </div>
      )}

      {/* Aviso quando usar padrão */}
      {useDefault && (
        <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">📋 Usando Configuração Padrão</h3>
          <p className="text-blue-300 text-sm">
            Com esta opção ativada, será usada a configuração padrão do sistema. 
            Os campos abaixo estão desabilitados e as configurações personalizadas serão removidas.
          </p>
        </div>
      )}

      {/* Seção desabilitada quando usar padrão */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${useDefault ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Curso Info */}
        <div className="space-y-6">
          <div className="bg-netflix-dark p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Informações do Curso</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título da Seção
                </label>
                <input
                  type="text"
                  value={aboutData.courseTitle}
                  onChange={(e) => handleInputChange('courseTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                  placeholder="Ex: Sobre o curso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição Principal do Curso
                </label>
                <textarea
                  value={aboutData.courseDescription}
                  onChange={(e) => handleInputChange('courseDescription', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                  placeholder="Descrição detalhada sobre o curso, metodologia, resultados..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição Adicional (Opcional)
                </label>
                <textarea
                  value={aboutData.additionalDescription}
                  onChange={(e) => handleInputChange('additionalDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                  placeholder="Informações adicionais sobre estratégias, técnicas, etc..."
                />
              </div>
            </div>
          </div>

          {/* Cards de Ação */}
          <div className="bg-netflix-dark p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Cards de Ação</h2>
            
            <div className="space-y-6">
              {/* WhatsApp Card */}
              <div className="border border-green-600/30 p-4 rounded-lg bg-green-600/10">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Card WhatsApp</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={aboutData.whatsappCardTitle}
                      onChange={(e) => handleInputChange('whatsappCardTitle', e.target.value)}
                      className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                      placeholder="Ex: Entre no Grupo VIP do Whatsapp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={aboutData.whatsappCardDescription}
                      onChange={(e) => handleInputChange('whatsappCardDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-green-500 focus:outline-none"
                      placeholder="Descrição do que o usuário encontrará no grupo..."
                    />
                  </div>
                </div>
              </div>

              {/* Materials Card */}
              <div className="border border-netflix-red/30 p-4 rounded-lg bg-netflix-red/10">
                <h3 className="text-lg font-semibold text-netflix-red mb-3">Card Materiais</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={aboutData.materialsCardTitle}
                      onChange={(e) => handleInputChange('materialsCardTitle', e.target.value)}
                      className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                      placeholder="Ex: Materiais Exclusivos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={aboutData.materialsCardDescription}
                      onChange={(e) => handleInputChange('materialsCardDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                      placeholder="Descrição dos materiais disponíveis..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Info */}
        <div className="space-y-6">
          <div className="bg-netflix-dark p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Informações do Instrutor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Instrutor
                </label>
                <input
                  type="text"
                  value={aboutData.instructorName}
                  onChange={(e) => handleInputChange('instructorName', e.target.value)}
                  className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                  placeholder="Ex: Rodolfo Mori"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título/Posição
                </label>
                <input
                  type="text"
                  value={aboutData.instructorTitle}
                  onChange={(e) => handleInputChange('instructorTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                  placeholder="Ex: Programador Sênior"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL da Imagem do Instrutor
                </label>
                <input
                  type="url"
                  value={aboutData.instructorImage}
                  onChange={(e) => handleInputChange('instructorImage', e.target.value)}
                  className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                  placeholder="/assets/instrutor.png ou URL externa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Biografia do Instrutor
                </label>
                <textarea
                  value={aboutData.instructorBio}
                  onChange={(e) => handleInputChange('instructorBio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-netflix-black border border-gray-600 rounded-md text-white focus:border-netflix-red focus:outline-none"
                  placeholder="Biografia detalhada do instrutor, experiências, conquistas..."
                />
              </div>

              {/* Preview da imagem */}
              {aboutData.instructorImage && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Preview da Imagem:</p>
                  <div className="w-32 h-32 bg-netflix-black rounded-lg overflow-hidden">
                    <img
                      src={imageError ? '/assets/instrutor.png' : aboutData.instructorImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        if (!imageError) {
                          setImageError(true);
                        }
                      }}
                      onLoad={() => {
                        setImageError(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button Mobile */}
          <div className="lg:hidden">
            <button
              onClick={handleSave}
              disabled={isSaving || !selectedInstance}
              className="w-full btn-primary px-6 py-3 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">💡 Dicas</h3>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Use \n para quebras de linha na descrição do curso</li>
          <li>• Os botões dos cards usam as configurações de botões da home</li>
          <li>• A imagem do instrutor deve ter proporção quadrada ou retrato</li>
          <li>• Mantenha as descrições claras e envolventes</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default AdminAboutCourse;