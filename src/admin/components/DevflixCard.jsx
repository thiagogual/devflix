// src/admin/components/DevflixCard.jsx (updated with clearer publication status)
import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';

const DevflixCard = ({ instance, onSelect, isSelected }) => {
  const { updateDevflixInstance, deleteDevflixInstance, duplicateDevflixInstance, togglePublishStatus } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(instance.name);
  const [path, setPath] = useState(instance.path);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showDuplicateForm, setShowDuplicateForm] = useState(false);
  const [duplicateName, setDuplicateName] = useState(`${instance.name} (cópia)`);
  const [duplicatePath, setDuplicatePath] = useState(`${instance.path}-copy`);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);

  // Multi-step duplicate flow
  const [duplicateStep, setDuplicateStep] = useState(1);
  const [classDates, setClassDates] = useState({
    aula1: '',
    aula2: '',
    aula3: '',
    aula4: '',
    aulaBonus: ''
  });

  // Check if the instance is published (default to true if not specified)
  const isPublished = instance.isPublished !== false;

  const handleSave = () => {
    // Validar o caminho
    const pathPattern = /^[a-z0-9\-]+$/;
    if (!pathPattern.test(path)) {
      alert('O caminho deve conter apenas letras minúsculas, números e hífen.');
      return;
    }

    updateDevflixInstance(instance.id, { name, path });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteDevflixInstance(instance.id);
    setShowConfirmDelete(false);
  };

  // Reset duplicate form
  const resetDuplicateForm = () => {
    setDuplicateName(`${instance.name} (cópia)`);
    setDuplicatePath(`${instance.path}-copy`);
    setDuplicateStep(1);
    setClassDates({
      aula1: '',
      aula2: '',
      aula3: '',
      aula4: '',
      aulaBonus: ''
    });
    setShowDuplicateForm(false);
  };

  // Validate step 1 and move to step 2
  const handleNextStep = () => {
    const pathPattern = /^[a-z0-9\-]+$/;
    if (!pathPattern.test(duplicatePath)) {
      alert('O caminho deve conter apenas letras minúsculas, números e hífen.');
      return;
    }
    if (!duplicateName.trim()) {
      alert('Por favor, insira um nome para a nova DevFlix.');
      return;
    }
    setDuplicateStep(2);
  };

  // Calculate other dates based on aula1 date
  const calculateDatesFromAula1 = (aula1Date) => {
    if (!aula1Date) return;

    const baseDate = new Date(aula1Date);
    const newDates = {
      aula1: aula1Date,
      aula2: '',
      aula3: '',
      aula4: '',
      aulaBonus: ''
    };

    // Aula 2: baseDate + 1 day
    const aula2Date = new Date(baseDate);
    aula2Date.setDate(aula2Date.getDate() + 1);
    newDates.aula2 = formatDateForInput(aula2Date);

    // Aula 3: baseDate + 2 days
    const aula3Date = new Date(baseDate);
    aula3Date.setDate(aula3Date.getDate() + 2);
    newDates.aula3 = formatDateForInput(aula3Date);

    // Aula 4: baseDate + 3 days
    const aula4Date = new Date(baseDate);
    aula4Date.setDate(aula4Date.getDate() + 3);
    newDates.aula4 = formatDateForInput(aula4Date);

    // Aula Bonus: baseDate + 4 days
    const aulaBonusDate = new Date(baseDate);
    aulaBonusDate.setDate(aulaBonusDate.getDate() + 4);
    newDates.aulaBonus = formatDateForInput(aulaBonusDate);

    setClassDates(newDates);
  };

  // Format date for datetime-local input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Handle aula1 date change
  const handleAula1Change = (e) => {
    const newDate = e.target.value;
    calculateDatesFromAula1(newDate);
  };

  // Handle individual date change
  const handleDateChange = (key, value) => {
    setClassDates(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDuplicate = async () => {
    try {
      setIsDuplicating(true);

      // Convert dates to ISO strings for Firebase
      const formattedDates = {};
      Object.keys(classDates).forEach(key => {
        if (classDates[key]) {
          formattedDates[key] = new Date(classDates[key]).toISOString();
        }
      });

      await duplicateDevflixInstance(instance.id, duplicatePath, duplicateName, formattedDates);
      resetDuplicateForm();
      alert(`DevFlix "${instance.name}" duplicada com sucesso como "${duplicateName}"!`);
    } catch (error) {
      alert(`Erro ao duplicar: ${error.message}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  // Handle toggling publication status
  const handleTogglePublish = async () => {
    try {
      setIsTogglingPublish(true);

      // If we're going to unpublish, confirm with the user
      if (isPublished) {
        if (!window.confirm(`Tem certeza que deseja despublicar "${instance.name}"? Esta ação tornará a página inacessível para o público.`)) {
          setIsTogglingPublish(false);
          return;
        }
      }

      // Toggle the publication status
      await togglePublishStatus(instance.id, !isPublished);

      // Show success message
      alert(`DevFlix "${instance.name}" ${!isPublished ? 'publicada' : 'despublicada'} com sucesso!`);
    } catch (error) {
      alert(`Erro ao ${isPublished ? 'despublicar' : 'publicar'}: ${error.message}`);
    } finally {
      setIsTogglingPublish(false);
    }
  };

  // Render duplicate form based on step
  const renderDuplicateForm = () => {
    if (duplicateStep === 1) {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Duplicar DevFlix</h3>
          <p className="text-gray-400 text-sm mb-4">Passo 1 de 2: Informações básicas</p>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Nome da Cópia</label>
            <input
              type="text"
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Caminho da Cópia</label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">/</span>
              <input
                type="text"
                value={duplicatePath}
                onChange={(e) => setDuplicatePath(e.target.value)}
                className="flex-1 bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                placeholder="dev-xx-copy"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Apenas letras minúsculas, números e hífen.</p>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={resetDuplicateForm}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleNextStep}
              className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      );
    }

    // Step 2: Configure dates
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-2">Configurar Datas</h3>
        <p className="text-gray-400 text-sm mb-4">Passo 2 de 2: Configure as datas das aulas</p>

        {/* Aula 1 - Primary date picker */}
        <div className="p-3 bg-netflix-red/10 border border-netflix-red/30 rounded-lg">
          <label className="block text-white font-semibold text-sm mb-1">
            📅 Data da Aula 1 (referência)
          </label>
          <p className="text-gray-400 text-xs mb-2">As demais datas serão calculadas automaticamente (1 dia de intervalo)</p>
          <input
            type="datetime-local"
            value={classDates.aula1}
            onChange={handleAula1Change}
            className="w-full bg-netflix-black border border-gray-600 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
          />
        </div>

        {/* Other dates - editable */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Aula 2</label>
            <input
              type="datetime-local"
              value={classDates.aula2}
              onChange={(e) => handleDateChange('aula2', e.target.value)}
              className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Aula 3</label>
            <input
              type="datetime-local"
              value={classDates.aula3}
              onChange={(e) => handleDateChange('aula3', e.target.value)}
              className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Aula 4</label>
            <input
              type="datetime-local"
              value={classDates.aula4}
              onChange={(e) => handleDateChange('aula4', e.target.value)}
              className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Aula Bônus</label>
            <input
              type="datetime-local"
              value={classDates.aulaBonus}
              onChange={(e) => handleDateChange('aulaBonus', e.target.value)}
              className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setDuplicateStep(1)}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            disabled={isDuplicating}
          >
            Voltar
          </button>
          <button
            onClick={handleDuplicate}
            className={`px-4 py-2 ${isDuplicating ? 'bg-gray-600' : 'bg-netflix-red hover:bg-red-700'} text-white rounded transition-colors flex items-center`}
            disabled={isDuplicating}
          >
            {isDuplicating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Duplicando...
              </>
            ) : (
              'Criar Duplicação'
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-netflix-dark rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ${
      isSelected ? 'ring-2 ring-netflix-red' : ''
    }`}>
      <div className="p-5">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Caminho</label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-1">/</span>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="flex-1 bg-netflix-black border border-gray-700 rounded px-3 py-2 text-white focus:border-netflix-red focus:outline-none"
                  placeholder="dev-xx"
                />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : showDuplicateForm ? (
          renderDuplicateForm()
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white">{instance.name}</h3>
                <p className="text-gray-400 mt-1">/{instance.path}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDuplicateForm(true)}
                  className="p-1.5 bg-gray-700 rounded-full hover:bg-indigo-600 transition-colors text-gray-300"
                  title="Duplicar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors text-gray-300"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-1.5 bg-gray-700 rounded-full hover:bg-red-600 transition-colors text-gray-300"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {/* Publication status badge - more prominent */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isPublished ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isPublished ? 'Publicado' : 'Não Publicado'}
                </span>

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  instance.bannerEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {instance.bannerEnabled ? 'Banner Ativo' : 'Sem Banner'}
                </span>

                <span className="text-gray-500 text-sm">
                  {instance.classes.length} aulas
                </span>
              </div>

              <button
                onClick={() => onSelect(instance.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  isSelected
                    ? 'bg-netflix-red text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                } transition-colors`}
              >
                {isSelected ? 'Selecionado' : 'Selecionar'}
              </button>
            </div>

            {/* Publication toggle button - NEW */}
            <div className="mt-3 flex justify-between items-center">
              <div className="flex space-x-2">
                <a
                  href={`/${instance.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-gray-400 hover:text-netflix-red transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  Ver site
                </a>
              </div>

              <button
                onClick={handleTogglePublish}
                disabled={isTogglingPublish}
                className={`inline-flex items-center text-sm px-2 py-1 rounded transition-colors ${
                  isTogglingPublish
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : isPublished
                      ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                      : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                }`}
              >
                {isTogglingPublish ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {isPublished ? (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                        </svg>
                        Despublicar
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Publicar
                      </>
                    )}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmação de exclusão */}
      {showConfirmDelete && (
        <div className="bg-netflix-black p-4 border-t border-gray-800">
          <p className="text-white text-sm mb-3">
            Tem certeza que deseja excluir <strong>{instance.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevflixCard;
