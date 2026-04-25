import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, Clock, BarChart2, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const navItems = [
  { icon: ShoppingCart, label: 'Ventas', path: '/' },
  { icon: Clock, label: 'Historial', path: '/history' },
  { icon: BarChart2, label: 'Reportes', path: '/reports' },
  { icon: Settings, label: 'Ajustes', path: '/settings' },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 px-6 py-2 flex justify-between items-center z-50">
      {navItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            twMerge(
              'flex flex-col items-center gap-1 transition-colors',
              isActive ? 'text-primary-600' : 'text-gray-400'
            )
          }
        >
          <Icon size={24} />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
