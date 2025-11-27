import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AdminPortal from './portals/AdminPortal';
import ClientPortal from './portals/ClientPortal';

const App: React.FC = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Check for admin route or admin subdomain
  const isAdmin = pathname.startsWith('/admin') || hostname.includes('admin');
  
  return (
    <BrowserRouter>
      {isAdmin ? <AdminPortal /> : <ClientPortal />}
    </BrowserRouter>
  );
};

export default App;