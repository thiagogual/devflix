// src/pages/ErrorPage.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ErrorPage = ({ message = "Página não encontrada", code = 404 }) => {
  return (
    <div className="min-h-screen bg-netflix-black py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div 
          className="bg-netflix-dark p-8 md:p-12 rounded-lg shadow-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-netflix-red mb-6">{code}</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{message}</h2>
          
          <p className="text-gray-300 mb-8">
            A página que você está procurando não foi encontrada. Verifique se o endereço está correto ou retorne para a página inicial.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/"
              className="btn-primary py-3 px-8 text-lg w-full sm:w-auto"
            >
              Voltar para Home
            </Link>
            
            <Link 
              to="/materiais"
              className="py-3 px-8 text-lg border border-white hover:bg-white hover:text-netflix-black transition-colors duration-300 rounded w-full sm:w-auto"
            >
              Ver Materiais
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ErrorPage;