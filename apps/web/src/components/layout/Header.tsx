import React from 'react';
import { Package, Leaf } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md px-6 py-5 flex items-center justify-between sticky top-0 z-40 border-b border-emerald-50">
      <div className="flex items-center gap-2.5">
        <div className="bg-emerald-600 p-2 rounded-2xl shadow-lg shadow-emerald-100 rotate-3">
          <Leaf size={22} className="text-white fill-emerald-200/20" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">DulceMar</h1>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.15em] mt-0.5">Frutas y Verduras</p>
        </div>
      </div>
      
      <button className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center active:scale-90 transition-transform">
        <span className="text-sm font-black text-emerald-700">JD</span>
      </button>
    </header>
  );
};

export default Header;
