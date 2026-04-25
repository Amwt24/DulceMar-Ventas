import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Leaf, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [name, setName] = useState('');
  const setVendor = useAuthStore((state) => state.setVendor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setVendor(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl shadow-emerald-900/10 text-center">
        <div className="bg-emerald-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg shadow-emerald-200">
          <Leaf size={40} className="text-white fill-emerald-200/20" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">¡Hola!</h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-10">Bienvenido a DulceMar</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-4 mb-2 block">Tu nombre</label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe quién vende hoy..."
              className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-black text-lg focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:scale-95 transition-all text-lg uppercase tracking-widest"
          >
            Empezar a vender
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
