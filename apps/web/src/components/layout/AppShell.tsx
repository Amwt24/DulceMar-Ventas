import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import OfflineBanner from './OfflineBanner';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    /* Contenedor que centra la app en pantallas grandes con un fondo atractivo */
    <div className="min-h-screen bg-emerald-50/50 flex justify-center">
      <div className="app-container flex flex-col">
        <Header />
        <OfflineBanner />
        <main className="flex-1 pb-24 px-5 pt-6 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default AppShell;
