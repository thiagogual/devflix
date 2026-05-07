import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VaultAuth } from '../lib/vault-sdk';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const vault = new VaultAuth({
          vaultUrl: import.meta.env.VITE_VAULT_URL || "http://localhost:4000",
          clientId: import.meta.env.VITE_VAULT_CLIENT_ID || "",
          redirectUri: import.meta.env.VITE_VAULT_REDIRECT_URI || `${window.location.origin}/callback`,
        });

        const success = await vault.handleCallback();

        if (success) {
          // Get the redirect path from storage or default to admin
          const redirectPath = localStorage.getItem("vault_redirect_after") || "/admin/dev";
          localStorage.removeItem("vault_redirect_after");
          navigate(redirectPath, { replace: true });
        } else {
          setError("Falha ao autenticar. Tente novamente.");
        }
      } catch (err) {
        console.error("Callback error:", err);
        setError("Erro ao processar autenticação.");
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-netflix-dark p-8 rounded-lg shadow-xl text-center">
          <div className="text-netflix-red mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Erro de Autenticação</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/admin/dev')}
            className="px-6 py-3 bg-netflix-red text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-netflix-red mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Autenticando...</h1>
        <p className="text-gray-400">Por favor, aguarde enquanto processamos seu login.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
