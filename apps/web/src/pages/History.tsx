import React, { useEffect, useState } from 'react';
import { useSalesStore } from '../stores/salesStore';
import { useAuthStore } from '../stores/authStore';
import { useShiftStore } from '../stores/shiftStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Clock, ShoppingBag, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Sale } from '../types';

const ADMINS = ['amawta', 'mary'];
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

const History: React.FC = () => {
  const { todaySales } = useSalesStore();
  const vendorName = useAuthStore((state) => state.vendorName);
  const { currentShift } = useShiftStore();
  const isAdmin = ADMINS.includes(vendorName?.toLowerCase() || '');

  const [serverSales, setServerSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMySales = async () => {
    if (!vendorName || !currentShift) return;
    setLoading(true);
    try {
      const { data } = await api.get('/sales/my', {
        params: { vendorName, shiftId: currentShift.id },
      });
      setServerSales(data);
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySales();
  }, [currentShift?.id, vendorName]);

  // Mezclar ventas locales (inmediatas) con las del servidor, evitando duplicados
  const allSales = React.useMemo(() => {
    if (!serverSales.length) return todaySales;
    const serverIds = new Set(serverSales.map((s) => s.id));
    const localOnly = todaySales.filter((s) => !serverIds.has(s.id));
    return [...localOnly, ...serverSales].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [todaySales, serverSales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Historial</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
            {isAdmin ? 'Mi turno' : 'Hoy'}
          </span>
          <button
            onClick={fetchMySales}
            disabled={loading}
            className="p-2 bg-slate-100 rounded-xl text-slate-500 active:scale-95 transition-all disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {allSales.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay ventas registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allSales.map((sale, index) => (
            <div
              key={sale.id || index}
              className="bg-white p-5 rounded-[2rem] shadow-sm border border-emerald-50 flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                  {sale.items[0]?.product?.emoji || '💰'}
                </div>
                <div>
                  <h4 className="font-black text-slate-800 leading-none mb-1">
                    {sale.items.length > 1
                      ? `${sale.items[0]?.product?.name || 'Producto'} +${sale.items.length - 1}`
                      : sale.items[0]?.product?.name || 'Venta mixta'}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
