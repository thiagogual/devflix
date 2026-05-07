// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase
// Substitua pelos seus dados do Firebase
const firebaseConfig = {
  apiKey: \'YOUR_KEY_HERE\',
  authDomain: "devflix-1b456.firebaseapp.com",
  projectId: "devflix-1b456",
  storageBucket: "devflix-1b456.firebasestorage.app",
  messagingSenderId: "15320161955",
  appId: "1:15320161955:web:cfaec31e4404057b53e916"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços do Firebase (Firestore e Storage apenas)
// Autenticação agora é gerenciada pelo Vault
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;