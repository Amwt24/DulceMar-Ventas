import { create } from 'zustand';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  setProducts: (products: Product[]) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [
    { id: '1', name: 'Banano', emoji: '🍌', price: 1.0, unit: 'u', categoryId: '1' },
    { id: '2', name: 'Sandía', emoji: '🍉', price: 1.0, unit: 'u', categoryId: '1' },
    { id: '3', name: 'Verde Barraganete', emoji: '🍌', price: 1.0, unit: 'u', categoryId: '1' },
    { id: '4', name: 'Melón', emoji: '🍈', price: 1.0, unit: 'u', categoryId: '1' },
    { id: '5', name: 'Piña', emoji: '🍍', price: 1.0, unit: 'u', categoryId: '1' },
    { id: '6', name: 'Papas', emoji: '🥔', price: 1.0, unit: 'u', categoryId: '2' },
    { id: '7', name: 'Zapotes', emoji: '🥭', price: 1.0, unit: 'u', categoryId: '1' },
    { id: '8', name: 'Naranjas', emoji: '🍊', price: 1.0, unit: 'u', categoryId: '1' },
    { id: '9', name: 'Plátano Maduro', emoji: '🍌', price: 1.0, unit: 'u', categoryId: '1' },
    { id: '10', name: 'Yuca Amarilla', emoji: '🍠', price: 1.0, unit: 'u', categoryId: '2' },
    { id: '11', name: 'Yuca Blanca', emoji: '🦴', price: 1.0, unit: 'u', categoryId: '2' },
    { id: '12', name: 'Cocos', emoji: '🥥', price: 1.0, unit: 'u', categoryId: '1' },
  ],
  isLoading: false,
  addProduct: (newProduct) => set((state) => ({
    products: [...state.products, { ...newProduct, id: Math.random().toString() }]
  })),
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  setProducts: (products) => set({ products }),
}));
