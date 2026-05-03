import { create } from 'zustand';
import { Product } from '../types';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  reorderProducts: (orderedIds: string[]) => Promise<void>;
  setProducts: (products: Product[]) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/products');
      set({ products: data });
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (newProduct) => {
    try {
      const { data } = await api.post('/products', newProduct);
      set((state) => ({ products: [...state.products, data] }));
    } catch (error: any) {
      console.error('❌ Error al crear producto:', error);
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const { data } = await api.put(`/products/${id}`, updates);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
      }));
    } catch (error) {
      console.error('❌ Error al actualizar producto:', error);
      throw error;
    }
  },

  reorderProducts: async (orderedIds) => {
    // Actualizar local inmediatamente para UX fluida
    set((state) => {
      const map = new Map(state.products.map((p) => [p.id, p]));
      const reordered = orderedIds.map((id) => map.get(id)).filter(Boolean) as Product[];
      return { products: reordered };
    });
    // Persistir en servidor
    try {
      await api.put('/products/reorder', { ids: orderedIds });
    } catch (error) {
      console.error('❌ Error al reordenar:', error);
      // En caso de error, recargar desde servidor
      const { data } = await api.get('/products');
      set({ products: data });
    }
  },

  setProducts: (products) => set({ products }),
}));
