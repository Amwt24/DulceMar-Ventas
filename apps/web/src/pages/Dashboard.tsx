import React, { useState } from 'react';
import { useProductStore } from '../stores/productStore';
import { useSalesStore } from '../stores/salesStore';
import { useAuthStore } from '../stores/authStore';
import { formatCurrency } from '../utils/formatCurrency';
import { TrendingUp, ShoppingBag, Sparkles, Plus, User, ShieldCheck } from 'lucide-react';
import ProductCard from '../components/products/ProductCard';
import SaleModal from '../components/products/SaleModal';
import ProductModal from '../components/products/ProductModal';
import { Product } from '../types';

const Dashboard: React.FC = () => {
  const { products } = useProductStore();
  const { todaySales } = useSalesStore();
  const vendorName = useAuthStore((state) => state.vendorName);
  const isAdmin = vendorName?.toLowerCase() === 'amawta';
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);
  const [showProductModal, setShowProductModal] = useState(false);

  const totalToday = todaySales.reduce((acc, sale) => acc + sale.total, 0);
  const salesCount = todaySales.length;

  return (
    <div className="space-y-8 relative">
      {/* Header Info */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
            {isAdmin ? <ShieldCheck size={16} strokeWidth={3} /> : <User size={16} strokeWidth={3} />}
          </div>
          <div className="flex flex-col">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              {isAdmin ? 'Administrador' : 'Vendedor'}
            </p>
            <p className="text-sm font-black text-slate-600 uppercase tracking-widest leading-none">{vendorName}</p>
          </div>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Hero Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-200">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-emerald-200" />
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-[0.2em]">Recaudado</p>
          </div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter drop-shadow-md">
            {formatCurrency(totalToday)}
          </h2>
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-2 border border-white/10">
              <ShoppingBag size={18} className="text-emerald-100" />
              <span className="text-sm font-black">{salesCount} Ventas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight tracking-tighter uppercase">Inventario</h2>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => {
                setProductToEdit(undefined);
                setShowProductModal(true);
              }}
              className="bg-emerald-600 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-100 active:scale-90 transition-all flex items-center gap-2"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="text-xs font-black uppercase pr-1">Añadir</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
              onEdit={() => {
                setProductToEdit(product);
                setShowProductModal(true);
              }}
            />
          ))}
        </div>
      </section>

      {/* Modals */}
      {selectedProduct && (
        <SaleModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showProductModal && isAdmin && (
        <ProductModal
          onClose={() => setShowProductModal(false)}
          productToEdit={productToEdit}
        />
      )}
    </div>
  );
};

export default Dashboard;
