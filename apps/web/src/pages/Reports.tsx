import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import { BarChart3, TrendingUp, Package, Calendar, ShieldCheck, User, Users, ChevronDown, History as HistoryIcon } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useSalesStore } from '../stores/salesStore';
import { useShiftStore } from '../stores/shiftStore';
import axios from 'axios';

interface ProductReport {
  name: string;
  emoji: string;
  total: number;
  count: number;
}

interface VendorReport {
  name: string;
  total: number;
  count: number;
}

interface DailyData {
  grandTotal: number;
  products: ProductReport[];
  vendors?: VendorReport[];
  shiftInfo?: any;
}

const Reports: React.FC = () => {
  const vendorName = useAuthStore((state) => state.vendorName);
  const { todaySales } = useSalesStore();
  const { currentShift } = useShiftStore();
  const isAdmin = vendorName?.toLowerCase() === 'amawta';

  const [displayData, setDisplayData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(isAdmin);
  const [shifts, setShifts] = useState<any[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('current');

  const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

  useEffect(() => {
    if (isAdmin) {
      // Cargar lista de turnos para el selector
      api.get('/shifts').then(res => setShifts(res.data));
    }
  }, [isAdmin, currentShift]);

  useEffect(() => {
    if (isAdmin) {
      const fetchShiftData = async () => {
        setLoading(true);
        try {
          const url = selectedShiftId === 'current' 
            ? '/reports/daily' 
            : `/reports/shift/${selectedShiftId}`;
          const response = await api.get(url);
          setDisplayData(response.data);
        } catch (error) {
          console.error('Error fetching shift report:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchShiftData();
    }
  }, [selectedShiftId, isAdmin, todaySales]);

  // Lógica para reporte de vendedor (Local - Solo turno actual)
  const getVendorReport = () => {
    const report: Record<string, ProductReport> = {};
    let total = 0;
    todaySales.forEach(sale => {
      total += sale.total;
      sale.items.forEach(item => {
        const id = item.productId;
        if (!report[id]) {
          report[id] = { name: item.product?.name || 'Producto', emoji: item.product?.emoji || '📦', total: 0, count: 0 };
        }
        report[id].total += item.price;
        report[id].count += 1;
      });
    });
    return { grandTotal: total, products: Object.values(report).sort((a, b) => b.total - a.total) };
  };

  const finalData = isAdmin ? displayData : getVendorReport();

  if (loading && isAdmin) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
            {isAdmin ? 'Reportes' : 'Mi Turno'}
          </h2>
        </div>
      </div>

      {/* Selector de Turno (Admin Only) */}
      {isAdmin && (
        <div className="px-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Seleccionar Turno</label>
          <div className="relative">
            <select 
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full bg-white border-2 border-emerald-50 rounded-2xl px-5 py-4 font-bold text-slate-700 appearance-none outline-none focus:border-emerald-500 shadow-sm transition-all"
            >
              <option value="current">Turno Actual (En vivo)</option>
              {shifts.filter(s => s.id !== currentShift?.id).map(s => (
                <option key={s.id} value={s.id}>
                  {new Date(s.openedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} | 
                  {new Date(s.openedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - 
                  {s.closedAt ? new Date(s.closedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Abierto'}
                </option>
              ))}
            </select>
            <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Info del Turno Seleccionado */}
      <div className={`mx-2 p-4 rounded-3xl flex items-center gap-4 ${isAdmin ? 'bg-slate-800 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
        <div className={`p-3 rounded-2xl ${isAdmin ? 'bg-white/10' : 'bg-emerald-100'}`}>
          {isAdmin ? <HistoryIcon size={20} /> : <User size={20} />}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-1">
            {isAdmin ? 'Reporte de Auditoría' : 'Vendedor Activo'}
          </p>
          <p className="text-sm font-black uppercase">
            {isAdmin ? (selectedShiftId === 'current' ? 'Turno en curso' : 'Turno Finalizado') : vendorName}
          </p>
        </div>
      </div>

      {/* Card de Gran Total */}
      <div className={`mx-2 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden ${isAdmin ? (selectedShiftId === 'current' ? 'bg-emerald-600' : 'bg-slate-900') : 'bg-emerald-600'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <BarChart3 size={120} />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-2">Recaudación</p>
          <h2 className="text-6xl font-black tracking-tighter mb-2">
            {formatCurrency(finalData?.grandTotal || 0)}
          </h2>
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
            <TrendingUp size={14} />
            {isAdmin && selectedShiftId !== 'current' ? 'Venta Finalizada' : 'Sincronizado'}
          </div>
        </div>
      </div>

      {isAdmin && finalData?.vendors && finalData.vendors.length > 0 && (
        <section className="space-y-4 px-2">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users size={16} /> Por Vendedor
          </h3>
          <div className="grid gap-2">
            {finalData.vendors.map((v, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-emerald-50 flex items-center justify-between shadow-sm">
                <h4 className="font-black text-slate-700">{v.name}</h4>
                <p className="font-black text-emerald-600 tracking-tighter">{formatCurrency(v.total)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 px-2 pb-6">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Detalle de Productos</h3>
        <div className="grid gap-3">
          {finalData?.products.map((prod, index) => (
            <div key={index} className="bg-white p-5 rounded-[2rem] border border-emerald-50 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner">{prod.emoji}</div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg leading-tight">{prod.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prod.count} ventas</p>
                </div>
              </div>
              <p className="text-xl font-black text-slate-800 tracking-tighter">{formatCurrency(prod.total)}</p>
            </div>
          ))}
          
          {(!finalData?.products || finalData.products.length === 0) && (
            <div className="bg-white rounded-[2rem] p-10 text-center border border-dashed border-slate-200">
              <Package size={40} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Sin ventas en este turno</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reports;
