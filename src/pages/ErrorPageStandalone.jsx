// src/pages/ErrorPageStandalone.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Versão da página de erro sem header e footer
 * Usada para erros de rotas não encontradas e páginas não publicadas
 */
const ErrorPageStandalone = ({ message = "Página não encontrada", code = 404, showHomeLink = true }) => {
  return (
    <div className="min-h-screen bg-netflix-black py-20 px-4 flex items-center justify-center">
      <div className="container mx-auto max-w-3xl">
        <motion.div 
          className="bg-netflix-dark p-8 md:p-12 rounded-lg shadow-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <Link to="/" className="flex items-center justify-center">
              <span className="text-netflix-red font-bold text-4xl">DEV<span className="text-white">FLIX</span></span>
            </Link>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-netflix-red mb-6">{code}</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{message}</h2>
          
          <p className="text-gray-300 mb-8">
            A página que você está procurando não foi encontrada ou não está disponível.
            {showHomeLink && " Por favor, selecione uma DevFlix disponível ou retorne para a página inicial."}
          </p>
          
          {showHomeLink && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                to="/"
                className="btn-primary py-3 px-8 text-lg w-full sm:w-auto"
              >
                Voltar para Home
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorPageStandalone;