import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AdminPortal from './portals/AdminPortal';
import ClientPortal from './portals/ClientPortal';
import DevLanding from './components/DevLanding';

const App: React.FC = () => {
  const [portal, setPortal] = useState<'admin' | 'client' | 'dev'>('dev');

  useEffect(() => {
    const hostname = window.location.hostname;
    const storedOverride = localStorage.getItem('eburon_portal_override');

    if (storedOverride === 'admin') {
      setPortal('admin');
    } else if (storedOverride === 'client') {
      setPortal('client');
    } else if (hostname === 'homeadmin.eburon.ai') {
      setPortal('admin');
    } else if (hostname === 'homiesearch.eburon.ai') {
      setPortal('client');
    } else {
      // Default to Dev Landing if no specific domain match (e.g. localhost)
      // Or we could default to ClientPortal if we want localhost to be client
      setPortal('dev');
    }
  }, []);

  if (portal === 'dev') {
    return <DevLanding />;
  }

  return (
    <BrowserRouter>
      {portal === 'admin' ? <AdminPortal /> : <ClientPortal />}
    </BrowserRouter>
  );
};

export default App;