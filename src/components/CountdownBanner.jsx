import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevflix } from '../contexts/DevflixContext';

const CountdownBanner = () => {
  const { currentDevflix, path, setCountdownBannerVisible } = useDevflix();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Obter a data da aula 1
  const aula1Date = currentDevflix?.classDates?.aula1;

  // Obter o link da aula 1 (primeira aula nas classes)
  const aula1Link = currentDevflix?.classes?.[0]?.videoLink || `/${path}/aula/1`;

  // Informar o contexto sobre a visibilidade do countdown
  useEffect(() => {
    setCountdownBannerVisible(isVisible);
  }, [isVisible, setCountdownBannerVisible]);

  useEffect(() => {
    if (!aula1Date) {
      setIsVisible(false);
      return;
    }

    const targetDate = new Date(aula1Date);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsVisible(false);
        return null;
      }

      setIsVisible(true);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Calcular imediatamente
    setTimeLeft(calculateTimeLeft());

    // Atualizar a cada segundo
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [aula1Date]);

  if (!isVisible || !timeLeft) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-[60]"
      >
        <div
          className="py-3 px-4"
          style={{
            background: 'linear-gradient(90deg, rgba(57, 211, 83, 0.95) 0%, rgba(40, 167, 69, 0.95) 50%, rgba(57, 211, 83, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="container-custom flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            {/* Countdown */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <span className="text-white font-semibold text-sm sm:text-base">Aula 1 começa em:</span>

              <div className="flex items-center gap-1">
                {/* Dias */}
                {timeLeft.days > 0 && (
                  <>
                    <div className="bg-black/30 rounded px-2 py-1 min-w-[40px] text-center">
                      <span className="text-white font-bold text-lg">{timeLeft.days}</span>
                      <span className="text-white/70 text-xs ml-1">d</span>
                    </div>
                    <span className="text-white/50">:</span>
                  </>
                )}

                {/* Horas */}
                <div className="bg-black/30 rounded px-2 py-1 min-w-[40px] text-center">
                  <span className="text-white font-bold text-lg">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  <span className="text-white/70 text-xs ml-1">h</span>
                </div>
                <span className="text-white/50">:</span>

                {/* Minutos */}
                <div className="bg-black/30 rounded px-2 py-1 min-w-[40px] text-center">
                  <span className="text-white font-bold text-lg">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-white/70 text-xs ml-1">m</span>
                </div>
                <span className="text-white/50">:</span>

                {/* Segundos */}
                <div className="bg-black/30 rounded px-2 py-1 min-w-[40px] text-center">
                  <span className="text-white font-bold text-lg">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  <span className="text-white/70 text-xs ml-1">s</span>
                </div>
              </div>
            </div>

            {/* Botão Definir Lembrete */}
            <a
              href={aula1Link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg"
              style={{ color: '#1a7f37' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Definir Lembrete
            </a>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CountdownBanner;
