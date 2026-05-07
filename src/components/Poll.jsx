// src/components/Poll.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { votePoll, subscribeToPoll } from '../firebase/firebaseService';

// Gerar ou obter ID do visitante do localStorage
const getVisitorId = () => {
  const key = 'devflix_visitor_id';
  let visitorId = localStorage.getItem(key);

  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(key, visitorId);
  }

  return visitorId;
};

const Poll = ({ poll }) => {
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [visitorId] = useState(getVisitorId);

  // Verificar se o usuario ja votou
  useEffect(() => {
    if (currentPoll?.voters && visitorId) {
      const userVote = currentPoll.voters[visitorId];
      if (userVote) {
        setSelectedOption(userVote);
        setHasVoted(true);
      }
    }
  }, [currentPoll?.voters, visitorId]);

  // Listener em tempo real para atualizacoes
  useEffect(() => {
    if (!poll?.id) return;

    const unsubscribe = subscribeToPoll(poll.id, (updatedPoll) => {
      if (updatedPoll) {
        setCurrentPoll(updatedPoll);
      }
    });

    return () => unsubscribe();
  }, [poll?.id]);

  // Calcular total de votos
  const totalVotes = Object.values(currentPoll?.votes || {}).reduce((sum, count) => sum + count, 0);

  // Calcular porcentagem de cada opcao
  const getPercentage = (optionId) => {
    const votes = currentPoll?.votes?.[optionId] || 0;
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  // Encontrar opcao vencedora
  const getWinningOption = () => {
    if (!currentPoll?.votes || totalVotes === 0) return null;

    let maxVotes = 0;
    let winningId = null;

    Object.entries(currentPoll.votes).forEach(([optionId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winningId = optionId;
      }
    });

    return winningId;
  };

  const winningOption = getWinningOption();

  // Votar
  const handleVote = useCallback(async (optionId) => {
    if (isVoting) return;

    setIsVoting(true);
    try {
      await votePoll(currentPoll.id, optionId, visitorId);
      setSelectedOption(optionId);
      setHasVoted(true);
    } catch (error) {
      console.error('Erro ao votar:', error);
    } finally {
      setIsVoting(false);
    }
  }, [currentPoll?.id, visitorId, isVoting]);

  if (!currentPoll || !currentPoll.enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-5 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl border border-gray-700/50 backdrop-blur-sm"
    >
      {/* Header da enquete */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📊</span>
        <h4 className="text-lg font-semibold text-white">Enquete</h4>
      </div>

      {/* Pergunta */}
      <p className="text-white font-medium mb-4">{currentPoll.question}</p>

      {/* Opcoes */}
      <div className="space-y-3">
        {(currentPoll.options || []).map((option) => {
          const percentage = getPercentage(option.id);
          const isSelected = selectedOption === option.id;
          const isWinning = winningOption === option.id && totalVotes > 0;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isVoting}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`relative w-full text-left rounded-lg overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'ring-2 ring-netflix-red'
                  : 'hover:ring-1 hover:ring-gray-500'
              } ${isVoting ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
            >
              {/* Background da barra de progresso */}
              <div className="absolute inset-0 bg-gray-700/50" />

              {/* Barra de progresso - só mostra após votar */}
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 ${
                    isSelected
                      ? 'bg-netflix-red/40'
                      : isWinning
                        ? 'bg-green-500/30'
                        : 'bg-gray-600/50'
                  }`}
                />
              )}

              {/* Conteudo */}
              <div className="relative flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {/* Indicador de selecao */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-netflix-red bg-netflix-red'
                        : 'border-gray-400'
                    }`}
                  >
                    {isSelected && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    )}
                  </div>

                  {/* Texto da opcao */}
                  <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {option.text}
                  </span>

                  {/* Badge de vencedor - só mostra após votar */}
                  {hasVoted && isWinning && totalVotes >= 3 && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
                      Liderando
                    </span>
                  )}
                </div>

                {/* Porcentagem - só mostra após votar */}
                {hasVoted && (
                  <span
                    className={`text-lg font-bold ${
                      isSelected ? 'text-netflix-red' : isWinning ? 'text-green-400' : 'text-gray-300'
                    }`}
                  >
                    {percentage}%
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Mensagem de voto */}
      <AnimatePresence>
        {hasVoted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center gap-2 text-sm text-gray-400"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Seu voto foi registrado! Voce pode mudar seu voto a qualquer momento.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Poll;
