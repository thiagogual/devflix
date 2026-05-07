// src/admin/pages/AdminHome.jsx (updated)
import { useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import DevflixEditor from '../components/DevflixEditor';
import BannerEditor from '../components/BannerEditor';
import LinkEditor from '../components/LinkEditor';
import HomeButtonsEditor from '../components/HomeButtonsEditor';  // Import the new component

const AdminHome = () => {
  const { isLoading } = useAdmin();
  
  // Efeito para scroll para o topo ao montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-white mb-6">Painel Principal</h2>
      
      <div className="space-y-8">
        <DevflixEditor />
        
        <div className="grid grid-cols-1 gap-6">
          {/* Add the HomeButtonsEditor above the other components */}
          <HomeButtonsEditor />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BannerEditor />
            <LinkEditor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;