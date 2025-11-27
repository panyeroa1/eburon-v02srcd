import React from 'react';

const DevLanding: React.FC = () => {
  const setPortal = (portal: 'admin' | 'client') => {
    // We can simulate domain switching by using query params or local storage for dev
    // For this implementation, we'll use a query param ?portal=admin or ?portal=client
    // But since we want to test the domain logic, we might need to mock window.location.hostname
    // However, in a real browser, we can't easily mock hostname without proxy.
    // So for dev, we will use a localStorage override that App.tsx checks.
    localStorage.setItem('eburon_portal_override', portal);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-8">
      <h1 className="text-4xl font-bold text-slate-800">Eburon Dev Portal</h1>
      <p className="text-slate-600">Select which portal to view (simulates domain routing)</p>
      
      <div className="flex gap-8">
        <button 
          onClick={() => setPortal('admin')}
          className="px-8 py-4 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          <h2 className="text-xl font-bold mb-2">Management Portal</h2>
          <p className="text-sm text-slate-400">homeadmin.eburon.ai</p>
        </button>

        <button 
          onClick={() => setPortal('client')}
          className="px-8 py-4 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          <h2 className="text-xl font-bold mb-2">Client Portal</h2>
          <p className="text-sm text-rose-200">homiesearch.eburon.ai</p>
        </button>
      </div>

      <button 
        onClick={() => {
            localStorage.removeItem('eburon_portal_override');
            window.location.reload();
        }}
        className="text-slate-400 hover:text-slate-600 underline"
      >
        Reset Override
      </button>
    </div>
  );
};

export default DevLanding;
