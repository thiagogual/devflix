// src/components/Loading.jsx - Premium 2025 loading component
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loading = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev < 90) {
          return prev + (90 - prev) / 10;
        }
        return prev;
      });
    }, 200);

    const timer = setTimeout(() => {
      setLoadingProgress(100);
      setTimeout(() => setIsVisible(false), 500);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-netflix-red/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Logo with premium glow effect */}
          <div className="mb-12 relative">
            {/* Outer glow rings */}
            <motion.div
              className="absolute -inset-8 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(229, 9, 20, 0.3) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            />

            {/* Inner glow */}
            <motion.div
              className="absolute -inset-4 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(229, 9, 20, 0.4) 0%, transparent 70%)',
              }}
              animate={{
                scale: [0.9, 1.1, 0.9],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            />

            {/* Logo text with gradient */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: 1
              }}
              transition={{
                scale: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                },
                opacity: {
                  duration: 0.5
                }
              }}
            >
              <span
                className="font-display font-bold text-6xl md:text-7xl tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #E50914 0%, #ff4d4d 50%, #f97316 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 0 30px rgba(229, 9, 20, 0.5))',
                }}
              >
                DEVFLIX
              </span>
            </motion.div>
          </div>

          {/* Premium progress bar */}
          <div className="w-72 mb-6">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
              }}
            >
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background: 'linear-gradient(90deg, #E50914, #ff4d4d, #f97316)',
                  boxShadow: '0 0 20px rgba(229, 9, 20, 0.5)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3 }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Loading text with dots animation */}
          <motion.div
            className="flex items-center gap-2 text-gray-400 font-display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span>Carregando</span>
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 bg-netflix-red rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </span>
            <span className="text-white/60 ml-2 tabular-nums">{Math.round(loadingProgress)}%</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;