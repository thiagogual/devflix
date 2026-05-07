// src/admin/components/ProtectedRoute.jsx
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, login } = useAuth();
  
  useEffect(() => {
    // Se não estiver carregando e não estiver autenticado, redireciona para o Vault
    if (!loading && !isAuthenticated()) {
      login();
    }
  }, [loading, isAuthenticated, login]);
  
  // Enquanto estiver verificando a autenticação, mostra um loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  // Se não estiver autenticado, mostra mensagem de redirecionamento
  if (!isAuthenticated()) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-netflix-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red mb-4"></div>
        <p className="text-white text-lg">Redirecionando para autenticação...</p>
      </div>
    );
  }
  
  // Se estiver autenticado, renderiza o conteúdo da rota
  return <Outlet />;
};

export default ProtectedRoute;