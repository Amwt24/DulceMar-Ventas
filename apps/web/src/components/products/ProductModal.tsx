import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { Product } from '../../types';

interface ProductModalProps {
  onClose: () => void;
  productToEdit?: Product;
}

const EMOJI_OPTIONS = [
  '🍎', '🍌', '🍉', '🍈', '🍍', '🍓', '🥑', '🥦', '🥕', '🌽', '🍅', '🥔', 
  '🍋', '🍑', '🍐', '🥭', '🥥', '🍇', '🍒', '🍊', '🥝', '🫐', '🍠', '🧅', 
  '🧄', '🥬', '🫑', '🍆', '🥜', '🌰', '🦴', '🎍', '🌾', '🌱', '🌳', '🌴'
];

const ProductModal: React.FC<ProductModalProps> = ({ onClose, productToEdit }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍎');
  const { addProduct, updateProduct } = useProductStore();

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setEmoji(productToEdit.emoji);
    }
  }, [productToEdit]);

  const handleSave = () => {
    if (!name) return;
    if (productToEdit) {
      updateProduct(productToEdit.id, { name, emoji });
    } else {
      addProduct({
        name,
        emoji,
        price: 1.0,
        unit: 'u',
        categoryId: '1'
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Icono</label>
            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-100">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-xl transition-all ${emoji === e ? 'bg-emerald-500 shadow-lg scale-110' : 'hover:bg-slate-200'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Nombre</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Yuca Amarilla"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!name}
            className="w-full bg-emerald-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest"
          >
            <Check size={20} strokeWidth={3} />
            {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
