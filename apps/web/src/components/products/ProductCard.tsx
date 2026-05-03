import React from 'react';
import { Product } from '../../types';
import { Settings2, GripVertical } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onEdit: () => void;
  // Drag & Drop (solo admin)
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDraggingOver?: boolean;
}

const ADMINS = ['amawta', 'mary'];

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onEdit,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDraggingOver,
}) => {
  const vendorName = useAuthStore((state) => state.vendorName);
  const isAdmin = ADMINS.includes(vendorName?.toLowerCase() || '');

  return (
    <div
      className={`relative group transition-all duration-150 ${isDraggingOver ? 'scale-105 opacity-70' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Handle de arrastre — solo visible para admin */}
      {isAdmin && (
        <div className="absolute top-2 left-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-xl text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical size={12} />
        </div>
      )}

      <button
        onClick={onClick}
        className={`w-full bg-white p-2 rounded-[2.5rem] shadow-sm hover:shadow-md border transition-all active:scale-95 ${
          isDraggingOver ? 'border-emerald-300' : 'border-emerald-50'
        }`}
      >
        <div className="bg-emerald-50/50 w-full aspect-square rounded-[2rem] flex items-center justify-center group-active:bg-emerald-100 transition-colors relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/40 rounded-full -mr-4 -mt-4 blur-xl"></div>
          <span className="text-5xl drop-shadow-md z-10" role="img" aria-label={product.name}>
            {product.emoji}
          </span>
        </div>
        <p className="text-[11px] font-black text-slate-700 uppercase tracking-tight truncate w-full px-1 pt-2 pb-1">
          {product.name}
        </p>
      </button>

      {/* Botón de editar — solo admin */}
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
