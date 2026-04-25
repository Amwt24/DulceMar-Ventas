import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { useAuthStore } from './stores/authStore';

function App() {
  const vendorName = useAuthStore((state) => state.vendorName);

  if (!vendorName) {
    return <Login />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-tighter uppercase">Ajustes</h2>
            <div className="bg-white rounded-[2rem] p-6 border border-emerald-50 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Usuario Activo</p>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 font-black">
                  {vendorName.substring(0, 2).toUpperCase()}
                </div>
                <p className="font-black text-slate-700">{vendorName}</p>
              </div>
              <button 
                onClick={() => useAuthStore.getState().logout()}
                className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl uppercase tracking-widest text-xs active:bg-red-100 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  );
}

export default App;
