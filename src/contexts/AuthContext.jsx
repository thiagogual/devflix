// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VaultAuth } from '../lib/vault-sdk.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Vault configuration
const vault = new VaultAuth({
  vaultUrl: import.meta.env.VITE_VAULT_URL || "http://localhost:4000",
  clientId: import.meta.env.VITE_VAULT_CLIENT_ID || "",
  redirectUri: import.meta.env.VITE_VAULT_REDIRECT_URI || `${window.location.origin}/callback`,
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync vault user to state
  const syncUser = useCallback((vaultUser) => {
    if (vaultUser) {
      setCurrentUser({
        uid: vaultUser.id,
        email: vaultUser.email,
        displayName: vaultUser.name,
      });
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Initialize
  useEffect(() => {
    vault.onAuthChange(syncUser);

    async function init() {
      // Load existing user from storage
      const user = vault.getUser();
      if (user) {
        syncUser(user);
      } else if (localStorage.getItem("vault_refresh_token")) {
        const refreshed = await vault.refresh();
        if (refreshed) {
          syncUser(vault.getUser());
        }
      }

      setLoading(false);
    }

    init();
  }, [syncUser]);

  // Login — redirects to Vault
  const login = useCallback(async () => {
    await vault.login();
  }, []);

  // Logout — clear tokens and redirect to Vault hub
  const logout = useCallback(async () => {
    await vault.logout(false);
    setCurrentUser(null);
    window.location.href = import.meta.env.VITE_VAULT_HUB_URL || "https://auth.clubeducacao.com.br";
  }, []);

  // Verificar se o usuário está autenticado
  const isAuthenticated = useCallback(() => {
    return !!currentUser;
  }, [currentUser]);

  // Verificar se a página atual está na área de admin
  const isAdminPage = () => {
    return window.location.pathname.startsWith('/admin');
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdminPage,
    vault,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};