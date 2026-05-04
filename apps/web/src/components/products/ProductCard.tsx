import React, { useRef } from 'react';
import { Product } from '../../types';
import { Settings2, GripVertical } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onEdit: () => void;
  // Drag & Drop (PC - solo admin)
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDraggingOver?: boolean;
  // Touch reorder (móvil - solo admin)
  onTouchReorderStart?: (productId: string) => void;
  onTouchReorderOver?: (productId: string) => void;
  onTouchReorderEnd?: () => void;
  isTouchDragging?: boolean;
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
  onTouchReorderStart,
  onTouchReorderOver,
  onTouchReorderEnd,
  isTouchDragging,
}) => {
  const vendorName = useAuthStore((state) => state.vendorName);
  const isAdmin = ADMINS.includes(vendorName?.toLowerCase() || '');
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);

  // — Touch long-press para iniciar el drag táctil —
  const handleGripTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    isDraggingRef.current = false;
    longPressTimer.current = setTimeout(() => {
      isDraggingRef.current = true;
      onTouchReorderStart?.(product.id);
      // Vibrar si el dispositivo lo soporta
      if ('vibrate' in navigator) navigator.vibrate(40);
    }, 300);
  };

  const handleGripTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (isDraggingRef.current) {
      onTouchReorderEnd?.();
      isDraggingRef.current = false;
    }
  };

  const handleGripTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) {
      // Si aún no inició el drag, cancelar el timer de long press al mover
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      return;
    }
    e.preventDefault();
    // Buscar el elemento debajo del dedo usando los puntos de contacto
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const card = el?.closest('[data-product-id]') as HTMLElement | null;
    if (card && card.dataset.productId && card.dataset.productId !== product.id) {
      onTouchReorderOver?.(card.dataset.productId);
    }
  };

  const isDimmed = isTouchDragging;

  return (
    <div
      data-product-id={product.id}
      className={`relative group transition-all duration-150 ${
        isDraggingOver || isTouchDragging ? 'scale-105 opacity-60 ring-2 ring-emerald-400 ring-offset-2 rounded-[2.5rem]' : ''
      }`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Handle de arrastre — visible siempre para admin en móvil */}
      {isAdmin && (
        <div
          className="absolute top-2 left-2 z-20 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-slate-400 shadow-sm touch-none select-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleGripTouchStart}
          onTouchMove={handleGripTouchMove}
          onTouchEnd={handleGripTouchEnd}
        >
          <GripVertical size={15} strokeWidth={2.5} />
        </div>
      )}

      <button
        onClick={onClick}
        className={`w-full bg-white p-2 rounded-[2.5rem] shadow-sm hover:shadow-md border transition-all active:scale-95 ${
          isDraggingOver || isTouchDragging ? 'border-emerald-300' : 'border-emerald-50'
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

      {/* Botón de editar — visible siempre para admin, tamaño táctil adecuado */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-2 right-2 z-20 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-md text-slate-500 active:scale-90 active:bg-emerald-50 active:text-emerald-600 transition-all"
          aria-label="Editar producto"
        >
          <Settings2 size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default ProductCard;
