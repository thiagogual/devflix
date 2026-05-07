// src/admin/components/AdminHeader.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';

const AdminHeader = () => {
  const { currentDevflix, devflixInstances, selectDevflix } = useAdmin();
  const { logout, currentUser } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-netflix-dark shadow-md py-4 px-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/dev" className="text-netflix-red font-bold text-2xl">
          DEV<span className="text-white">FLIX</span>
          <span className="text-white text-sm ml-2">ADMIN</span>
        </Link>
        
        <div className="relative">
          <button 
            className="flex items-center bg-netflix-black rounded-md px-4 py-2 text-white hover:bg-opacity-80 transition-colors"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="mr-2">
              {currentDevflix ? currentDevflix.name : 'Selecione uma DevFlix'}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-netflix-black rounded-md shadow-lg overflow-hidden z-50">
              <div className="py-1">
                {devflixInstances.map((instance) => (
                  <button
                    key={instance.id}
                    className={`block w-full text-left px-4 py-2 hover:bg-netflix-red transition-colors ${
                      currentDevflix && currentDevflix.id === instance.id ? 'bg-netflix-red bg-opacity-50' : ''
                    }`}
                    onClick={() => {
                      selectDevflix(instance.id);
                      setDropdownOpen(false);
                    }}
                  >
                    {instance.name} <span className="text-gray-400 text-xs">/{instance.path}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser && (
            <span className="text-gray-400 text-sm">
              {currentUser.email}
            </span>
          )}
          <Link 
            to="/"
            className="text-gray-400 hover:text-white transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver Site
          </Link>
          <button
            onClick={logout}
            className="flex items-center text-gray-400 hover:text-netflix-red transition-colors"
            title="Sair"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span className="ml-1">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;