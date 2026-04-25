import React, { useState } from 'react';
import { Product } from '../../types';
import { Settings2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onEdit: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onEdit }) => {
  const vendorName = useAuthStore((state) => state.vendorName);
  const isAdmin = vendorName?.toLowerCase() === 'amawta';

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className="w-full bg-white p-2 rounded-[2.5rem] shadow-sm hover:shadow-md border border-emerald-50 flex flex-col items-center gap-3 active:scale-95 transition-all"
      >
        <div className="bg-emerald-50/50 w-full aspect-square rounded-[2rem] flex items-center justify-center group-active:bg-emerald-100 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/40 rounded-full -mr-4 -mt-4 blur-xl"></div>
          <span className="text-5xl drop-shadow-md z-10" role="img" aria-label={product.name}>
            {product.emoji}
          </span>
        </div>
        <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight mb-2 truncate w-full px-2">
          {product.name}
        </p>
      </button>
      
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
        >
          <Settings2 size={12} />
        </button>
      )}
    </div>
  );
};

export default ProductCard;
