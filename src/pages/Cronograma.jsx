// src/pages/Cronograma.jsx - Trilha visual das aulas
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useDevflix } from '../contexts/DevflixContext';
import { getCronogramaDescriptions } from '../firebase/firebaseService';
import PromoBanner from '../components/PromoBanner';
import FloatingWhatsAppButton from '../components/FloatingWhatsAppButton';

// Formatar data para exibição
const formatClassDate = (isoDate) => {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return {
    weekday: weekdays[date.getDay()],
    day: date.getDate().toString().padStart(2, '0'),
    month: months[date.getMonth()],
    hours: date.getHours().toString().padStart(2, '0'),
    minutes: date.getMinutes().toString().padStart(2, '0')
  };
};

// Mapear ID da aula para a chave de data
const getClassDateKey = (classId) => {
  const mapping = {
    1: 'aula1',
    2: 'aula2',
    3: 'aula3',
    4: 'aula4',
    5: 'aulaBonus'
  };
  return mapping[classId];
};

// Verificar se a aula já passou
const isClassPast = (isoDate) => {
  if (!isoDate) return false;
  return new Date(isoDate) < new Date();
};

// Verificar se a aula é hoje
const isClassToday = (isoDate) => {
  if (!isoDate) return false;
  const classDate = new Date(isoDate);
  const today = new Date();
  return classDate.toDateString() === today.toDateString();
};

const Cronograma = () => {
  const {
    currentDevflix,
    classes,
    countdownVisible,
    path,
    banner,
    bannerEnabled,
    bannerVisible,
    toggleBannerVisibility
  } = useDevflix();
  const [descriptions, setDescriptions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const classDates = currentDevflix?.classDates || {};
  const basePath = path ? `/${path}` : '';

  // Padding top baseado no countdown/banner
  const getContentPadding = () => {
    if (countdownVisible) {
      return 'pt-[164px] sm:pt-[116px]';
    }
    return (bannerEnabled && bannerVisible) ? 'pt-[76px]' : 'pt-16';
  };

  // Carregar descrições do Firebase
  useEffect(() => {
    const loadDescriptions = async () => {
      if (!currentDevflix?.id) return;

      try {
        const desc = await getCronogramaDescriptions(currentDevflix.id);
        setDescriptions(desc || {});
      } catch (error) {
        console.error('Erro ao carregar descrições:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDescriptions();
  }, [currentDevflix]);

  // Preparar dados das aulas com informações completas
  const aulasList = classes.map((classItem, index) => {
    const classId = parseInt(classItem.id) || index + 1;
    const dateKey = getClassDateKey(classId);
    const classDate = classDates[dateKey];
    const formattedDate = formatClassDate(classDate);
    const isPast = isClassPast(classDate);
    const isToday = isClassToday(classDate);

    return {
      ...classItem,
      classId,
      dateKey,
      classDate,
      formattedDate,
      isPast,
      isToday,
      isBonus: classId === 5 || classItem.title?.toLowerCase().includes('bônus') || classItem.title?.toLowerCase().includes('bonus'),
      description: descriptions[`aula${classId}`] || ''
    };
  });

  // Padding top baseado no countdown
  const contentPadding = getContentPadding();

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-netflix-black ${contentPadding} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-netflix-black ${contentPadding} pb-20`}>
      {/* Banner promocional */}
      <PromoBanner
        banner={banner}
        enabled={bannerEnabled}
        onToggle={toggleBannerVisibility}
      />

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton />

      <div className="container-custom pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Sua Trilha de <span className="text-netflix-red">Aprendizado</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Acompanhe sua jornada de transformação. Cada aula é um passo em direção ao seu novo futuro como programador.
          </p>
        </motion.div>

        {/* Trilha das Aulas */}
        <div className="relative max-w-5xl mx-auto">
          {/* Linha da trilha (desktop) - para antes do final */}
          <div className="hidden md:block absolute left-1/2 top-0 w-1 bg-gradient-to-b from-netflix-red via-orange-500 to-yellow-500 transform -translate-x-1/2 rounded-full z-0" style={{ height: 'calc(100% - 120px)' }} />

          {/* Linha da trilha (mobile) - para antes do final */}
          <div className="md:hidden absolute left-8 top-0 w-1 bg-gradient-to-b from-netflix-red via-orange-500 to-yellow-500 rounded-full z-0" style={{ height: 'calc(100% - 120px)' }} />

          {/* Cards das aulas */}
          {aulasList.map((aula, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={aula.id}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-center mb-12 md:mb-16 ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Marcador na trilha */}
                <div className={`absolute md:left-1/2 left-8 transform -translate-x-1/2 z-10`}>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className={`w-8 h-8 rounded-full border-4 flex items-center justify-center ${
                      aula.isPast
                        ? 'bg-green-500 border-green-400'
                        : aula.isToday
                          ? 'bg-netflix-red border-red-400 animate-pulse'
                          : aula.isBonus
                            ? 'bg-yellow-500 border-yellow-400'
                            : 'bg-gray-700 border-gray-500'
                    }`}
                  >
                    {aula.isPast ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-white text-xs font-bold">{aula.classId}</span>
                    )}
                  </motion.div>
                </div>

                {/* Espaçador para mobile */}
                <div className="w-20 md:hidden" />

                {/* Card da aula */}
                <div className={`flex-1 md:w-5/12 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                  <motion.a
                    href={aula.videoLink || `${basePath}/aula/${aula.classId}`}
                    target={aula.videoLink ? "_blank" : undefined}
                    rel={aula.videoLink ? "noopener noreferrer" : undefined}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`block rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                      aula.isBonus
                        ? 'bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-600/30'
                        : 'bg-netflix-dark border border-gray-800'
                    } hover:border-netflix-red/50 hover:shadow-netflix-red/20`}
                  >
                    {/* Imagem da aula */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={aula.coverImage || `/images/aula${aula.classId}.jpg`}
                        alt={aula.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />

                      {/* Overlay com gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                      {/* Badge de status */}
                      <div className="absolute top-3 left-3">
                        {aula.isPast ? (
                          <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Disponível
                          </span>
                        ) : aula.isToday ? (
                          <span className="px-3 py-1 bg-netflix-red text-white text-xs font-semibold rounded-full animate-pulse">
                            HOJE!
                          </span>
                        ) : aula.isBonus ? (
                          <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-semibold rounded-full">
                            BÔNUS
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-700/90 text-white text-xs font-semibold rounded-full">
                            Em breve
                          </span>
                        )}
                      </div>

                      {/* Número da aula */}
                      <div className="absolute bottom-3 right-3">
                        <span
                          className="text-5xl font-black text-white/20"
                          style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}
                        >
                          {aula.isBonus ? 'B' : aula.classId}
                        </span>
                      </div>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-netflix-red/90 flex items-center justify-center shadow-lg">
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo do card */}
                    <div className="p-5">
                      {/* Título */}
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {aula.title}
                      </h3>

                      {/* Descrição */}
                      {aula.description && (
                        <p className="text-gray-400 text-sm mb-4">
                          {aula.description}
                        </p>
                      )}

                      {/* Data e horário */}
                      {aula.formattedDate && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl ${
                          aula.isBonus ? 'bg-yellow-500/10' : 'bg-netflix-red/10'
                        }`}>
                          {/* Calendário */}
                          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${
                            aula.isBonus ? 'bg-yellow-500' : 'bg-netflix-red'
                          }`}>
                            <span className="text-white text-xs font-medium uppercase">
                              {aula.formattedDate.month}
                            </span>
                            <span className="text-white text-xl font-bold leading-none">
                              {aula.formattedDate.day}
                            </span>
                          </div>

                          {/* Info da data */}
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">
                              {aula.formattedDate.weekday}
                            </p>
                            <p className={`text-lg font-bold ${
                              aula.isBonus ? 'text-yellow-500' : 'text-netflix-red'
                            }`}>
                              {aula.formattedDate.hours}:{aula.formattedDate.minutes}
                            </p>
                          </div>

                          {/* Ícone de relógio */}
                          <div className={`p-2 rounded-full ${
                            aula.isBonus ? 'bg-yellow-500/20' : 'bg-netflix-red/20'
                          }`}>
                            <svg className={`w-5 h-5 ${
                              aula.isBonus ? 'text-yellow-500' : 'text-netflix-red'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.a>
                </div>

                {/* Espaçador para layout alternado (desktop) */}
                <div className="hidden md:block md:w-5/12" />
              </motion.div>
            );
          })}

          {/* Fim da trilha */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center relative z-10"
          >
            {/* Alinhamento mobile (left-8 = 32px) e desktop (centralizado) */}
            <div className="ml-[26px] md:ml-0 md:absolute md:left-1/2 md:-translate-x-1/2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Mensagem final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8 md:mt-12 relative z-10"
          >
            <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <p className="text-green-400 font-medium">
                Complete todas as aulas e transforme sua carreira!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cronograma;
