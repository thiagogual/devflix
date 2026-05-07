// src/admin/pages/AdminPolls.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import {
  getPolls,
  createPoll,
  updatePoll,
  deletePoll,
  getScheduleStartData
} from '../../firebase/firebaseService';

const AdminPolls = () => {
  const { currentDevflix } = useAdmin();
  const [polls, setPolls] = useState([]);
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    stepId: '',
    question: '',
    options: [
      { id: 'opt1', text: '' },
      { id: 'opt2', text: '' }
    ],
    enabled: true
  });

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      if (!currentDevflix?.id) return;

      try {
        setIsLoading(true);

        // Carregar steps do aquecimento
        const stepsData = await getScheduleStartData(currentDevflix.id);
        setSteps(stepsData || []);

        // Carregar enquetes
        const pollsData = await getPolls(currentDevflix.id);
        setPolls(pollsData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentDevflix?.id]);

  // Abrir modal para nova enquete
  const openNewPollModal = () => {
    setEditingPoll(null);
    setFormData({
      stepId: '',
      question: '',
      options: [
        { id: 'opt1', text: '' },
        { id: 'opt2', text: '' }
      ],
      enabled: true
    });
    setShowModal(true);
  };

  // Abrir modal para editar enquete
  const openEditPollModal = (poll) => {
    setEditingPoll(poll);
    setFormData({
      stepId: poll.stepId || '',
      question: poll.question || '',
      options: poll.options || [
        { id: 'opt1', text: '' },
        { id: 'opt2', text: '' }
      ],
      enabled: poll.enabled !== false
    });
    setShowModal(true);
  };

  // Fechar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingPoll(null);
  };

  // Adicionar opcao
  const addOption = () => {
    if (formData.options.length >= 8) {
      alert('Maximo de 8 opcoes');
      return;
    }

    const newId = 'opt' + (formData.options.length + 1) + '_' + Date.now();
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { id: newId, text: '' }]
    }));
  };

  // Remover opcao
  const removeOption = (optionId) => {
    if (formData.options.length <= 2) {
      alert('Minimo de 2 opcoes');
      return;
    }

    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== optionId)
    }));
  };

  // Atualizar texto da opcao
  const updateOptionText = (optionId, text) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === optionId ? { ...opt, text } : opt
      )
    }));
  };

  // Salvar enquete
  const handleSave = async () => {
    if (!formData.stepId) {
      alert('Selecione um passo do aquecimento');
      return;
    }

    if (!formData.question.trim()) {
      alert('Digite uma pergunta');
      return;
    }

    const emptyOptions = formData.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      alert('Preencha todas as opcoes');
      return;
    }

    // Verificar se ja existe enquete para este step
    const existingPoll = polls.find(p => p.stepId === formData.stepId && p.id !== editingPoll?.id);
    if (existingPoll) {
      alert('Ja existe uma enquete para este passo. Edite ou exclua a existente.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingPoll) {
        // Atualizar enquete existente
        await updatePoll(editingPoll.id, {
          stepId: formData.stepId,
          question: formData.question,
          options: formData.options,
          enabled: formData.enabled
        });

        setPolls(prev => prev.map(p =>
          p.id === editingPoll.id
            ? { ...p, ...formData }
            : p
        ));
      } else {
        // Criar nova enquete
        const newPollId = await createPoll({
          instanceId: currentDevflix.id,
          stepId: formData.stepId,
          question: formData.question,
          options: formData.options,
          enabled: formData.enabled
        });

        setPolls(prev => [...prev, {
          id: newPollId,
          instanceId: currentDevflix.id,
          ...formData,
          votes: {},
          voters: {}
        }]);
      }

      closeModal();
      alert('Enquete salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar enquete:', error);
      alert('Erro ao salvar enquete');
    } finally {
      setIsSaving(false);
    }
  };

  // Deletar enquete
  const handleDelete = async (pollId) => {
    if (!confirm('Tem certeza que deseja excluir esta enquete? Todos os votos serao perdidos.')) {
      return;
    }

    try {
      await deletePoll(pollId);
      setPolls(prev => prev.filter(p => p.id !== pollId));
      alert('Enquete excluida com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir enquete:', error);
      alert('Erro ao excluir enquete');
    }
  };

  // Toggle enabled
  const toggleEnabled = async (poll) => {
    try {
      await updatePoll(poll.id, { enabled: !poll.enabled });
      setPolls(prev => prev.map(p =>
        p.id === poll.id ? { ...p, enabled: !p.enabled } : p
      ));
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  // Obter nome do step
  const getStepName = (stepId) => {
    const step = steps.find(s => s.id === stepId || s.id === parseInt(stepId));
    return step?.title || `Passo ${stepId}`;
  };

  // Calcular total de votos
  const getTotalVotes = (poll) => {
    return Object.values(poll.votes || {}).reduce((sum, count) => sum + count, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-netflix-red rounded-full mx-auto mb-4"></div>
          <p className="text-white">Carregando enquetes...</p>
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
              <h1 className="text-4xl font-bold text-white mb-2">Enquetes de Votacao</h1>
              <p className="text-gray-400">
                Crie enquetes para cada passo do Aquecimento e veja os resultados em tempo real.
              </p>
            </div>
            <button
              onClick={openNewPollModal}
              className="flex items-center gap-2 bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-netflix-red/25 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nova Enquete
            </button>
          </div>
        </div>

        {/* Lista de Enquetes */}
        {polls.length === 0 ? (
          <div className="text-center py-20 bg-netflix-dark rounded-xl border border-gray-700">
            <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-gray-400 text-lg mb-4">Nenhuma enquete criada</p>
            <button
              onClick={openNewPollModal}
              className="bg-netflix-red hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Criar Primeira Enquete
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => {
              const totalVotes = getTotalVotes(poll);

              return (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-netflix-dark rounded-xl p-6 border ${
                    poll.enabled ? 'border-gray-700' : 'border-gray-800 opacity-60'
                  }`}
                >
                  {/* Header da enquete */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-netflix-red/20 text-netflix-red text-xs font-semibold rounded">
                          {getStepName(poll.stepId)}
                        </span>
                        {!poll.enabled && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs font-semibold rounded">
                            Desativada
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-white">{poll.question}</h3>
                    </div>

                    {/* Acoes */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleEnabled(poll)}
                        className={`p-2 rounded-lg transition-colors ${
                          poll.enabled
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                        title={poll.enabled ? 'Desativar' : 'Ativar'}
                      >
                        {poll.enabled ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => openEditPollModal(poll)}
                        className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(poll.id)}
                        className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Opcoes com resultados */}
                  <div className="space-y-2">
                    {(poll.options || []).map((option) => {
                      const votes = poll.votes?.[option.id] || 0;
                      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

                      return (
                        <div key={option.id} className="relative bg-gray-800/50 rounded-lg overflow-hidden">
                          {/* Barra de progresso */}
                          <div
                            className="absolute inset-y-0 left-0 bg-netflix-red/20"
                            style={{ width: `${percentage}%` }}
                          />

                          {/* Conteudo */}
                          <div className="relative flex items-center justify-between p-3">
                            <span className="text-white">{option.text}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400 text-sm">
                                {votes} voto{votes !== 1 ? 's' : ''}
                              </span>
                              <span className="text-netflix-red font-bold">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total de votos */}
                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      Total: {totalVotes} voto{totalVotes !== 1 ? 's' : ''}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {Object.keys(poll.voters || {}).length} participantes
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar Enquete */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-netflix-dark rounded-xl p-6 w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {editingPoll ? 'Editar Enquete' : 'Nova Enquete'}
              </h3>

              <div className="space-y-4">
                {/* Selecionar Step */}
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Passo do Aquecimento *
                  </label>
                  <select
                    value={formData.stepId}
                    onChange={(e) => setFormData(prev => ({ ...prev, stepId: e.target.value }))}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-netflix-red"
                  >
                    <option value="">Selecione um passo...</option>
                    {steps.map((step, index) => (
                      <option key={step.id} value={step.id}>
                        Passo {index + 1}: {step.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pergunta */}
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Pergunta *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Ex: Qual framework voce prefere?"
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-netflix-red placeholder-gray-500"
                  />
                </div>

                {/* Opcoes */}
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Opcoes de Resposta *
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOptionText(option.id, e.target.value)}
                          placeholder={`Opcao ${index + 1}`}
                          className="flex-1 bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-netflix-red placeholder-gray-500"
                        />
                        {formData.options.length > 2 && (
                          <button
                            onClick={() => removeOption(option.id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            title="Remover opcao"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {formData.options.length < 8 && (
                    <button
                      onClick={addOption}
                      className="mt-2 flex items-center gap-2 text-netflix-red hover:text-red-400 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Adicionar opcao
                    </button>
                  )}
                </div>

                {/* Ativar/Desativar */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.enabled ? 'bg-netflix-red' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.enabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                  <span className="text-gray-300">
                    {formData.enabled ? 'Enquete ativada' : 'Enquete desativada'}
                  </span>
                </div>
              </div>

              {/* Botoes */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={closeModal}
                  disabled={isSaving}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-netflix-red hover:bg-red-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPolls;
