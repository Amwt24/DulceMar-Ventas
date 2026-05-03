import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Search } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { Product } from '../../types';

interface ProductModalProps {
  onClose: () => void;
  productToEdit?: Product;
}

const DEFAULT_PRESETS = [0.5, 1.0, 1.5, 2.0];

const EMOJI_CATALOG: { label: string; items: { emoji: string; name: string }[] }[] = [
  {
    label: '🍑 Frutas tropicales',
    items: [
      { emoji: '🍌', name: 'banano plátano' },
      { emoji: '🍍', name: 'piña ananas' },
      { emoji: '🥭', name: 'mango zapote' },
      { emoji: '🥥', name: 'coco' },
      { emoji: '🍈', name: 'melón' },
      { emoji: '🍉', name: 'sandía patilla' },
      { emoji: '🍑', name: 'durazno melocotón' },
      { emoji: '🥝', name: 'kiwi' },
      { emoji: '🫐', name: 'arándano mora azul' },
      { emoji: '🍓', name: 'fresa frutilla' },
      { emoji: '🍒', name: 'cereza' },
      { emoji: '🍇', name: 'uva' },
      { emoji: '🍎', name: 'manzana roja' },
      { emoji: '🍏', name: 'manzana verde' },
      { emoji: '🍐', name: 'pera' },
      { emoji: '🍊', name: 'naranja mandarina' },
      { emoji: '🍋', name: 'limón' },
      { emoji: '🫒', name: 'oliva aceituna' },
      { emoji: '🍅', name: 'tomate' },
      { emoji: '🫑', name: 'pimiento ají' },
    ],
  },
  {
    label: '🥦 Verduras y hojas',
    items: [
      { emoji: '🥦', name: 'brócoli broccoli' },
      { emoji: '🥬', name: 'col lechuga acelga' },
      { emoji: '🥕', name: 'zanahoria' },
      { emoji: '🌽', name: 'maíz choclo' },
      { emoji: '🫛', name: 'vainita arveja' },
      { emoji: '🧅', name: 'cebolla' },
      { emoji: '🧄', name: 'ajo' },
      { emoji: '🍆', name: 'berenjena' },
      { emoji: '🥒', name: 'pepino' },
      { emoji: '🥑', name: 'aguacate palta' },
      { emoji: '🌿', name: 'hierbas cilantro perejil' },
      { emoji: '🍃', name: 'hoja verde' },
      { emoji: '🌱', name: 'plántula brote' },
    ],
  },
  {
    label: '🥔 Tubérculos y raíces',
    items: [
      { emoji: '🥔', name: 'papa patata' },
      { emoji: '🍠', name: 'camote yuca batata' },
      { emoji: '🦴', name: 'yuca blanca' },
      { emoji: '🌰', name: 'castaña nuez' },
      { emoji: '🥜', name: 'maní cacahuate' },
    ],
  },
  {
    label: '🌾 Granos',
    items: [
      { emoji: '🌾', name: 'arroz trigo grano cereal' },
      { emoji: '🫘', name: 'frijol lenteja' },
      { emoji: '🥚', name: 'huevo' },
      { emoji: '🍯', name: 'miel' },
    ],
  },
  {
    label: '📦 General',
    items: [
      { emoji: '📦', name: 'caja producto' },
      { emoji: '🛒', name: 'carrito compras' },
      { emoji: '🏷️', name: 'etiqueta precio' },
      { emoji: '💚', name: 'verde' },
      { emoji: '🌴', name: 'palma' },
      { emoji: '🌳', name: 'árbol' },
    ],
  },
];

const ALL_EMOJIS = EMOJI_CATALOG.flatMap((cat) => cat.items);

const ProductModal: React.FC<ProductModalProps> = ({ onClose, productToEdit }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍎');
  // 4 precios rápidos que aparecen como botones al vender
  const [presets, setPresets] = useState<string[]>(['0.50', '1.00', '1.50', '2.00']);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { addProduct, updateProduct } = useProductStore();

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setEmoji(productToEdit.emoji);
      if (productToEdit.presetPrices && productToEdit.presetPrices.length > 0) {
        // Rellenar hasta 4 slots
        const filled = [...productToEdit.presetPrices.map((p) => p.toFixed(2))];
        while (filled.length < 4) filled.push('');
        setPresets(filled.slice(0, 4));
      } else {
        // Si no tiene presets, usar precio base como referencia
        const base = Number(productToEdit.price).toFixed(2);
        setPresets([base, '', '', '']);
      }
    }
  }, [productToEdit]);

  const filteredCatalog = useMemo(() => {
    if (!search.trim()) return EMOJI_CATALOG;
    const q = search.toLowerCase().trim();
    return [
      {
        label: `🔍 Resultados para "${search}"`,
        items: ALL_EMOJIS.filter((e) => e.name.includes(q)),
      },
    ];
  }, [search]);

  const handlePresetChange = (index: number, value: string) => {
    const next = [...presets];
    next[index] = value;
    setPresets(next);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    // Validar presets: al menos 1 precio válido
    const validPresets = presets
      .map((p) => parseFloat(p))
      .filter((p) => !isNaN(p) && p > 0);

    if (validPresets.length === 0) {
      setError('Ingresa al menos un precio válido');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        emoji,
        price: validPresets[0], // El primer precio es el base/default
        presetPrices: validPresets,
      };
      if (productToEdit) {
        await updateProduct(productToEdit.id, payload);
      } else {
        await addProduct({ ...payload, unit: 'u', categoryId: '1' });
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al guardar. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-7 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 flex-shrink-0">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Preview del icono */}
          <div className="flex items-center gap-4 bg-emerald-50 rounded-2xl px-4 py-3">
            <span className="text-4xl">{emoji}</span>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Icono seleccionado</p>
              <p className="text-xs font-bold text-slate-500">Toca uno del catálogo para cambiar</p>
            </div>
          </div>

          {/* Buscador */}
          <div>
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Buscar icono</label>
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ej: banano, yuca, naranja..."
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-sm focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Catálogo de emojis */}
          <div>
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Catálogo</label>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {filteredCatalog.map((category) => (
                <div key={category.label}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{category.label}</p>
                  <div className="grid grid-cols-7 gap-1">
                    {category.items.map(({ emoji: e }) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`text-xl p-1.5 rounded-xl transition-all ${
                          emoji === e ? 'bg-emerald-500 shadow-md scale-110' : 'hover:bg-slate-100 active:scale-95'
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                    {category.items.length === 0 && (
                      <p className="col-span-7 text-xs text-slate-400 py-2 text-center">Sin resultados</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Nombre del producto</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Yuca Amarilla"
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Precios rápidos */}
          <div>
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
              Precios rápidos de venta
            </label>
            <p className="text-[10px] text-slate-400 font-bold mb-3">
              Estos son los botones que verá el vendedor al seleccionar el producto. El primero es el precio por defecto.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((val, i) => (
                <div key={i} className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.05"
                    min="0"
                    value={val}
                    onChange={(e) => handlePresetChange(i, e.target.value)}
                    placeholder={i === 0 ? 'Requerido' : 'Opcional'}
                    className={`w-full pl-7 pr-3 py-3 bg-slate-50 border-2 rounded-2xl font-black text-lg outline-none transition-all
                      ${i === 0 ? 'border-emerald-200 focus:border-emerald-500' : 'border-slate-100 focus:border-emerald-400'}`}
                  />
                  {i === 0 && (
                    <span className="absolute -top-1.5 right-2 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || isSaving}
          className="mt-5 flex-shrink-0 w-full bg-emerald-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest"
        >
          <Check size={20} strokeWidth={3} />
          {isSaving ? 'Guardando...' : productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
