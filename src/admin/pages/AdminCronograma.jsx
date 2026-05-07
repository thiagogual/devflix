// src/admin/pages/AdminCronograma.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import {
  getCronogramaDescriptions,
  updateCronogramaDescriptions
} from '../../firebase/firebaseService';

// Formatar data para exibição
const formatClassDate = (isoDate) => {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${weekdays[date.getDay()]} ${day}/${month} às ${hours}:${minutes}`;
};

// Converter ISO para datetime-local format
const isoToDatetimeLocal = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Converter datetime-local para ISO
const datetimeLocalToIso = (datetimeLocal) => {
  if (!datetimeLocal) return null;
  return new Date(datetimeLocal).toISOString();
};

// Gerar chave de data para a aula
const getClassDateKey = (classId) => {
  if (classId === 5 || classId === '5') return 'aulaBonus';
  return `aula${classId}`;
};

const AdminCronograma = () => {
  const { currentDevflix, updateDevflixInstance } = useAdmin();
  const [descriptions, setDescriptions] = useState({});
  const [classDates, setClassDates] = useState({});
  const [classes, setClasses] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingDateId, setEditingDateId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassTitle, setNewClassTitle] = useState('');
  const [newClassDate, setNewClassDate] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');

  // Carregar dados ao montar
  useEffect(() => {
    const loadData = async () => {
      if (!currentDevflix?.id) return;

      try {
        const desc = await getCronogramaDescriptions(currentDevflix.id);
        setDescriptions(desc || {});
        setClassDates(currentDevflix?.classDates || {});
        setClasses(currentDevflix?.classes || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDevflix]);

  // Atualizar descrição de uma aula
  const handleDescriptionChange = (classId, value) => {
    setDescriptions(prev => ({
      ...prev,
      [`aula${classId}`]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Atualizar data/hora de uma aula
  const handleDateChange = (classId, value) => {
    const dateKey = getClassDateKey(classId);
    setClassDates(prev => ({
      ...prev,
      [dateKey]: datetimeLocalToIso(value)
    }));
    setHasUnsavedChanges(true);
  };

  // Salvar todas as alterações
  const saveChanges = async () => {
    if (!currentDevflix?.id) {
      alert('Nenhuma instância selecionada');
      return;
    }

    setIsSaving(true);
    try {
      // Salvar descrições
      await updateCronogramaDescriptions(currentDevflix.id, descriptions);

      // Salvar datas e aulas
      await updateDevflixInstance(currentDevflix.id, {
        classDates: classDates,
        classes: classes
      });

      setHasUnsavedChanges(false);
      setEditingDateId(null);
      alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  // Descartar alterações
  const discardChanges = async () => {
    if (!currentDevflix?.id) return;

    try {
      const desc = await getCronogramaDescriptions(currentDevflix.id);
      setDescriptions(desc || {});
      setClassDates(currentDevflix?.classDates || {});
      setClasses(currentDevflix?.classes || []);
      setHasUnsavedChanges(false);
      setEditingDateId(null);
    } catch (error) {
      console.error('Erro ao descartar alterações:', error);
    }
  };

  // Adicionar nova aula
  const handleAddClass = () => {
    if (!newClassTitle.trim()) {
      alert('Digite um título para a aula');
      return;
    }

    const newId = (classes.length + 1).toString();
    const newClass = {
      id: newId,
      title: newClassTitle,
      coverImage: `/images/aula${newId}.jpg`,
      videoLink: ''
    };

    // Adicionar a aula
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);

    // Adicionar a data se fornecida
    if (newClassDate) {
      const dateKey = getClassDateKey(newId);
      setClassDates(prev => ({
        ...prev,
        [dateKey]: datetimeLocalToIso(newClassDate)
      }));
    }

    // Adicionar descrição se fornecida
    if (newClassDescription) {
      setDescriptions(prev => ({
        ...prev,
        [`aula${newId}`]: newClassDescription
      }));
    }

    setHasUnsavedChanges(true);
    setShowAddModal(false);
    setNewClassTitle('');
    setNewClassDate('');
    setNewClassDescription('');
  };

  // Remover aula
  const handleRemoveClass = (classId) => {
    if (classes.length <= 1) {
      alert('É necessário ter pelo menos uma aula.');
      return;
    }

    if (!confirm('Tem certeza que deseja remover esta aula? Esta ação não pode ser desfeita.')) {
      return;
    }

    // Remover a aula
    const updatedClasses = classes.filter(cls => cls.id !== classId);

    // Reordenar IDs
    const reorderedClasses = updatedClasses.map((cls, index) => ({
      ...cls,
      id: (index + 1).toString()
    }));

    setClasses(reorderedClasses);

    // Remover a data associada
    const dateKey = getClassDateKey(classId);
    const updatedDates = { ...classDates };
    delete updatedDates[dateKey];

    // Reorganizar as datas para os novos IDs
    const newDates = {};
    reorderedClasses.forEach((cls, index) => {
      const oldId = classes[index]?.id;
      const oldDateKey = getClassDateKey(oldId);
      const newDateKey = getClassDateKey(cls.id);
      if (classDates[oldDateKey]) {
        newDates[newDateKey] = classDates[oldDateKey];
      }
    });
    setClassDates(newDates);

    // Reorganizar descrições
    const newDescriptions = {};
    reorderedClasses.forEach((cls, index) => {
      const oldId = classes[index]?.id;
      if (descriptions[`aula${oldId}`]) {
        newDescriptions[`aula${cls.id}`] = descriptions[`aula${oldId}`];
      }
    });
    setDescriptions(newDescriptions);

    setHasUnsavedChanges(true);
  };

  // Mover aula para cima/baixo
  const moveClass = (fromIndex, direction) => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= classes.length) return;

    const updatedClasses = [...classes];
    [updatedClasses[fromIndex], updatedClasses[toIndex]] = [updatedClasses[toIndex], updatedClasses[fromIndex]];

    // Reordenar IDs
    const reorderedClasses = updatedClasses.map((cls, index) => ({
      ...cls,
      id: (index + 1).toString()
    }));

    setClasses(reorderedClasses);
    setHasUnsavedChanges(true);
  };

  // Template padrão com descrições
  const applyDefaultTemplate = () => {
    const defaultDescriptions = {
      aula1: 'Nesta primeira aula, você vai dar os primeiros passos na programação e entender os fundamentos essenciais para sua jornada como desenvolvedor.',
      aula2: 'Avançando no aprendizado, você vai construir seu primeiro projeto prático e aplicar os conceitos aprendidos na aula anterior.',
      aula3: 'Hora de elevar o nível! Você vai aprender técnicas avançadas e boas práticas utilizadas por desenvolvedores profissionais.',
      aula4: 'Na aula final, você vai consolidar todo o conhecimento e criar um projeto completo do zero ao deploy.',
      aula5: 'Conteúdo exclusivo de bônus! Dicas especiais e recursos extras para acelerar ainda mais sua evolução como programador.'
    };

    setDescriptions(defaultDescriptions);
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-netflix-red rounded-full mx-auto mb-4"></div>
          <p className="text-white">Carregando cronograma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Página de Cronograma</h1>
              <p className="text-gray-400">
                Configure a "Trilha de Aprendizado" - edite datas, descrições, adicione ou remova aulas.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/25 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nova Aula
              </button>
              <button
                onClick={applyDefaultTemplate}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Template
              </button>
            </div>
          </div>
        </div>

        {/* Botões de Salvar/Descartar */}
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex gap-4 sticky top-0 z-10 bg-netflix-black py-4"
          >
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </>
              )}
            </button>
            <button
              onClick={discardChanges}
              disabled={isSaving}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Descartar Alterações
            </button>
          </motion.div>
        )}

        {/* Lista de Aulas */}
        <div className="space-y-6">
          {classes.map((classItem, index) => {
            const classId = parseInt(classItem.id) || index + 1;
            const dateKey = getClassDateKey(classId);
            const classDate = classDates[dateKey];
            const isBonus = classId === 5 || classItem.title?.toLowerCase().includes('bônus');
            const isEditingDate = editingDateId === classId;

            return (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl overflow-hidden border ${
                  isBonus
                    ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border-yellow-600/30'
                    : 'bg-netflix-dark border-gray-700'
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="md:w-64 flex-shrink-0 relative">
                    <div className="relative aspect-video md:aspect-auto md:h-full">
                      <img
                        src={classItem.coverImage || `/images/aula${classId}.jpg`}
                        alt={classItem.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          isBonus
                            ? 'bg-yellow-500 text-black'
                            : 'bg-netflix-red text-white'
                        }`}>
                          {isBonus ? 'BÔNUS' : `AULA ${classId}`}
                        </span>
                      </div>

                      {/* Botões de Mover e Excluir */}
                      <div className="absolute top-3 right-3 flex gap-1">
                        <button
                          onClick={() => moveClass(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 bg-black/70 hover:bg-black text-white rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Mover para cima"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveClass(index, 'down')}
                          disabled={index === classes.length - 1}
                          className="p-1.5 bg-black/70 hover:bg-black text-white rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Mover para baixo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveClass(classItem.id)}
                          disabled={classes.length <= 1}
                          className="p-1.5 bg-red-600/70 hover:bg-red-600 text-white rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Remover aula"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 p-6">
                    {/* Info da aula */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-3">
                        {classItem.title}
                      </h3>

                      {/* Data e Hora - Editável */}
                      <div className="mb-4">
                        <label className="block text-gray-400 text-sm font-medium mb-2">
                          Data e Horário da Aula
                        </label>

                        {isEditingDate ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="datetime-local"
                              value={isoToDatetimeLocal(classDate)}
                              onChange={(e) => handleDateChange(classId, e.target.value)}
                              className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-netflix-red"
                            />
                            <button
                              onClick={() => setEditingDateId(null)}
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                              title="Confirmar"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            {classDate ? (
                              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                isBonus ? 'bg-yellow-500/20 text-yellow-400' : 'bg-netflix-red/20 text-netflix-red'
                              }`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatClassDate(classDate)}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm italic">Data não definida</span>
                            )}
                            <button
                              onClick={() => setEditingDateId(classId)}
                              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                              title="Editar data"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Descrição (editável) */}
                    <div>
                      <label className="block text-gray-400 text-sm font-medium mb-2">
                        Descrição da aula (aparece na trilha)
                      </label>
                      <textarea
                        value={descriptions[`aula${classId}`] || ''}
                        onChange={(e) => handleDescriptionChange(classId, e.target.value)}
                        placeholder="Ex: Nesta aula você vai aprender os fundamentos de HTML e CSS, criando sua primeira página web do zero..."
                        rows={3}
                        className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-netflix-red placeholder-gray-500 resize-none"
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Máximo recomendado: 150 caracteres ({(descriptions[`aula${classId}`] || '').length}/150)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {classes.length === 0 && (
          <div className="text-center py-20 bg-netflix-dark rounded-xl border border-gray-700">
            <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-400 text-lg mb-4">Nenhuma aula encontrada</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Adicionar Primeira Aula
            </button>
          </div>
        )}

        {/* Preview */}
        {classes.length > 0 && (
          <div className="mt-12 bg-netflix-dark rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Pré-visualização
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Veja como as aulas aparecerão na página de cronograma.
            </p>

            <div className="space-y-4">
              {classes.slice(0, 2).map((classItem, index) => {
                const classId = parseInt(classItem.id) || index + 1;
                const dateKey = getClassDateKey(classId);
                const classDate = classDates[dateKey];
                const description = descriptions[`aula${classId}`];

                return (
                  <div key={classItem.id} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg">
                    <div className="w-32 aspect-video rounded overflow-hidden flex-shrink-0">
                      <img
                        src={classItem.coverImage || `/images/aula${classId}.jpg`}
                        alt={classItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{classItem.title}</h4>
                      {classDate && (
                        <p className="text-netflix-red text-sm mt-1">{formatClassDate(classDate)}</p>
                      )}
                      {description ? (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{description}</p>
                      ) : (
                        <p className="text-gray-500 text-sm mt-1 italic">Sem descrição</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Adicionar Aula */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-netflix-dark rounded-xl p-6 w-full max-w-md border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Adicionar Nova Aula</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Título da Aula *
                  </label>
                  <input
                    type="text"
                    value={newClassTitle}
                    onChange={(e) => setNewClassTitle(e.target.value)}
                    placeholder="Ex: Aula 5 - Projeto Final"
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-netflix-red placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Data e Horário
                  </label>
                  <input
                    type="datetime-local"
                    value={newClassDate}
                    onChange={(e) => setNewClassDate(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-netflix-red"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newClassDescription}
                    onChange={(e) => setNewClassDescription(e.target.value)}
                    placeholder="Breve descrição do conteúdo da aula..."
                    rows={3}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-netflix-red placeholder-gray-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddClass}
                  className="flex-1 bg-netflix-red hover:bg-red-700 text-white py-3 rounded-lg transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCronograma;
