// src/admin/components/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-netflix-black text-white">
      <AdminHeader />
      <AdminSidebar />
      
      <div className="pl-64 pt-16">
        <main className="container mx-auto px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;