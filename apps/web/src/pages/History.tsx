import React from 'react';
import { useSalesStore } from '../stores/salesStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Clock, ShoppingBag, ChevronRight } from 'lucide-react';

const History: React.FC = () => {
  const { todaySales } = useSalesStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Historial</h2>
        </div>
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
          Hoy
        </span>
      </div>

      {todaySales.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay ventas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todaySales.map((sale, index) => (
            <div 
              key={index}
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  {sale.items[0]?.product?.emoji || '💰'}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 leading-none mb-1">
                    {sale.items[0]?.product?.name || 'Venta mixta'}
                  </h4>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(sale.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <p className="text-lg font-black text-emerald-600 tracking-tighter">
                  {formatCurrency(sale.total)}
                </p>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
