import React, { useEffect, useRef, useState } from 'react';
import { useProductStore } from '../stores/productStore';
import { useSalesStore } from '../stores/salesStore';
import { useAuthStore } from '../stores/authStore';
import { useShiftStore } from '../stores/shiftStore';
import { formatCurrency } from '../utils/formatCurrency';
import { ShoppingBag, Plus, User, ShieldCheck, Play, Square, AlertCircle } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import SaleModal from '../components/products/SaleModal';
import ProductModal from '../components/products/ProductModal';
import { Product } from '../types';

const ADMINS = ['amawta', 'mary'];

const Dashboard: React.FC = () => {
  const { products, fetchProducts, reorderProducts } = useProductStore();
  const { todaySales } = useSalesStore();
  const vendorName = useAuthStore((state) => state.vendorName);
  const isAdmin = ADMINS.includes(vendorName?.toLowerCase() || '');

  const { currentShift, fetchCurrentShift, openShift, closeShift, isLoading: loadingShift, startPolling, stopPolling } = useShiftStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);
  const [showProductModal, setShowProductModal] = useState(false);

  // Drag & Drop state
  const dragIdRef = useRef<string | null>(null);
  const [draggingOverId, setDraggingOverId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentShift();
    fetchProducts();
    startPolling();
    return () => stopPolling();
  }, []);

  // Refrescar productos cuando cambia el turno
  useEffect(() => {
    if (currentShift) fetchProducts();
  }, [currentShift?.id]);

  const totalToday = todaySales.reduce((acc, sale) => acc + sale.total, 0);
  const salesCount = todaySales.length;

  // ── Drag & Drop handlers (solo para admin) ──────────────────────────
  const handleDragStart = (e: React.DragEvent, productId: string) => {
    dragIdRef.current = productId;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (targetId !== dragIdRef.current) {
      setDraggingOverId(targetId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) {
      setDraggingOverId(null);
      return;
    }

    const currentIds = products.map((p) => p.id);
    const sourceIndex = currentIds.indexOf(sourceId);
    const targetIndex = currentIds.indexOf(targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Reorganizar: sacar el origen e insertarlo en la posición del destino
    const newIds = [...currentIds];
    newIds.splice(sourceIndex, 1);
    newIds.splice(targetIndex, 0, sourceId);

    reorderProducts(newIds);
    dragIdRef.current = null;
    setDraggingOverId(null);
  };

  const handleDragEnd = () => {
    dragIdRef.current = null;
    setDraggingOverId(null);
  };
  // ────────────────────────────────────────────────────────────────────

  if (loadingShift) return (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 relative">
      {/* Control de turno (solo admin) */}
      {isAdmin && (
        <div className={`mx-2 p-6 rounded-[2.5rem] flex items-center justify-between border-2 transition-all ${currentShift ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Caja</p>
            <h3 className={`text-xl font-black uppercase ${currentShift ? 'text-emerald-700' : 'text-amber-700'}`}>
              {currentShift ? 'Abierto' : 'Cerrado'}
            </h3>
          </div>
          <button
            onClick={() => currentShift ? closeShift(vendorName!) : openShift(vendorName!)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 ${currentShift ? 'bg-red-500 text-white shadow-red-100' : 'bg-emerald-600 text-white shadow-emerald-100'}`}
          >
            {currentShift ? <><Square size={16} fill="currentColor" /> Cerrar</> : <><Play size={16} fill="currentColor" /> Abrir</>}
          </button>
        </div>
      )}

      {!currentShift && !isAdmin && (
        <div className="bg-white rounded-[2.5rem] p-10 text-center border-2 border-amber-100 shadow-xl shadow-amber-900/5 m-4">
          <AlertCircle size={40} className="mx-auto mb-6 text-amber-600" />
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">Turno Cerrado</h2>
          <p className="text-slate-400 font-bold text-sm">El administrador debe abrir la caja para empezar.</p>
        </div>
      )}

      {(currentShift || isAdmin) && (
        <>
          {/* Info del usuario */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {isAdmin ? <ShieldCheck size={16} strokeWidth={3} /> : <User size={16} strokeWidth={3} />}
              </div>
              <p className="text-sm font-black text-slate-600 uppercase tracking-widest">{vendorName}</p>
            </div>
            {currentShift && (
              <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                Inicio: {new Date(currentShift.openedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Total del día */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200">
            <div className="relative z-10">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-[0.2em] mb-1">Recaudado</p>
              <h2 className="text-5xl font-black mb-6 tracking-tighter">{formatCurrency(totalToday)}</h2>
              <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl inline-flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-100" />
                <span className="text-sm font-black">{salesCount} Ventas</span>
              </div>
            </div>
          </div>

          {/* Grilla de productos */}
          <section className={!currentShift && isAdmin ? 'opacity-40 grayscale pointer-events-none' : ''}>
            <div className="flex items-center justify-between mb-4 px-2">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Productos</h2>
                {isAdmin && (
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Arrastra para reordenar</p>
                )}
              </div>
              {isAdmin && (
                <button
                  onClick={() => { setProductToEdit(undefined); setShowProductModal(true); }}
                  className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg active:scale-90 transition-all"
                >
                  <Plus size={20} strokeWidth={3} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                  onEdit={() => { setProductToEdit(product); setShowProductModal(true); }}
                  // Drag & drop solo para admin
                  draggable={isAdmin}
                  onDragStart={(e) => handleDragStart(e, product.id)}
                  onDragOver={(e) => handleDragOver(e, product.id)}
                  onDrop={(e) => handleDrop(e, product.id)}
                  onDragEnd={handleDragEnd}
                  isDraggingOver={draggingOverId === product.id}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {selectedProduct && currentShift && (
        <SaleModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {showProductModal && isAdmin && (
        <ProductModal onClose={() => setShowProductModal(false)} productToEdit={productToEdit} />
      )}
    </div>
  );
};

export default Dashboard;
