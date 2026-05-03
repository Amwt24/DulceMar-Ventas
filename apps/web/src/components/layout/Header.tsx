import React from 'react';
import dulcemarIcon from '../../assets/dulcemar-icon.png';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-40 border-b border-emerald-50">
      <div className="flex items-center gap-2.5">
        {/* Logo DulceMar */}
        <img
          src={dulcemarIcon}
          alt="DulceMar"
          className="w-11 h-11 rounded-2xl shadow-lg shadow-emerald-100 object-cover"
        />
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">DulceMar</h1>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em] mt-0.5">Frutas y Verduras</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
