import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
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
        <Route path="/history" element={
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Historial de {vendorName}</h2>
            <p className="text-gray-500">Aquí se mostrarán tus ventas hoy.</p>
          </div>
        } />
        <Route path="/settings" element={
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Ajustes</h2>
            <button 
              onClick={() => useAuthStore.getState().logout()}
              className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl uppercase tracking-widest text-xs"
            >
              Cerrar Sesión de {vendorName}
            </button>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppShell>
  );
}

export default App;
