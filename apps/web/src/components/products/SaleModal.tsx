import React, { useState } from 'react';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { Check, X, Edit3 } from 'lucide-react';
import { useSalesStore } from '../../stores/salesStore';
import { useShiftStore } from '../../stores/shiftStore';
import { clsx } from 'clsx';

interface SaleModalProps {
  product: Product;
  onClose: () => void;
}

// Fallback de precios si el producto no tiene presets configurados
const DEFAULT_PRESETS = [0.5, 1.0, 1.5, 2.0];

const SaleModal: React.FC<SaleModalProps> = ({ product, onClose }) => {
  // Usar presetPrices del producto si existen, sino los defaults
  const presetPrices: number[] =
    product.presetPrices && product.presetPrices.length > 0
      ? product.presetPrices
      : DEFAULT_PRESETS;

  const defaultPrice = presetPrices[0]; // El primero es el default

  const [selectedPrice, setSelectedPrice] = useState<number>(defaultPrice);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const { addSale } = useSalesStore();
  const { currentShift } = useShiftStore();

  const handleConfirm = async () => {
    const finalPrice = isCustom ? parseFloat(customValue) : selectedPrice;
    if (isNaN(finalPrice) || finalPrice <= 0 || !currentShift) return;

    await addSale(
      {
        total: finalPrice,
        items: [{ productId: product.id, quantity: 1, price: finalPrice, product }],
        createdAt: new Date(),
      },
      currentShift.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm px-4 pb-8">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
        <div className="p-8">
          {/* Header del producto */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <span className="text-6xl drop-shadow-sm">{product.emoji}</span>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{product.name}</h3>
                <p className="text-slate-400 font-medium text-sm">Selecciona el valor de venta</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-400 active:bg-slate-200">
              <X size={20} />
            </button>
          </div>

          {!isCustom ? (
            <div className="mb-8">
              {/* Grid de precios */}
              <div className={clsx(
                'grid gap-4 mb-4',
                presetPrices.length <= 2 ? 'grid-cols-2' :
                presetPrices.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
              )}>
                {presetPrices.map((price, index) => (
                  <button
                    key={price}
                    onClick={() => setSelectedPrice(price)}
                    className={clsx(
                      'p-5 rounded-2xl border-2 font-black text-2xl transition-all active:scale-95 relative',
                      selectedPrice === price
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : 'bg-slate-50 border-slate-100 text-slate-700 hover:border-emerald-200'
                    )}
                  >
                    {formatCurrency(price)}
                    {index === 0 && selectedPrice !== price && (
                      <span className="absolute top-1.5 right-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                        Base
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsCustom(true)}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold active:bg-slate-50 hover:border-slate-300 transition-all"
              >
                <Edit3 size={18} />
                Otro valor
              </button>
            </div>
          ) : (
            <div className="space-y-4 mb-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-3xl font-black focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
              <button onClick={() => setIsCustom(false)} className="text-sm font-bold text-emerald-600 px-2">
                ← Volver a precios rápidos
              </button>
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={isCustom ? !customValue : false}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all text-xl"
          >
            <Check size={24} strokeWidth={3} />
            Confirmar {formatCurrency(isCustom ? parseFloat(customValue || '0') : selectedPrice)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleModal;
