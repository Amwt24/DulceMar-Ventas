import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Sale } from '../types';
import axios from 'axios';
import { useAuthStore } from './authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

interface SalesState {
  todaySales: Sale[];
  currentShiftId: string | null; // Nuevo campo
  isLoading: boolean;
  addSale: (sale: Sale, shiftId: string) => Promise<void>;
  syncWithShift: (shiftId: string | null) => void;
  clearSales: () => void;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      todaySales: [],
      currentShiftId: null,
      isLoading: false,
      
      syncWithShift: (shiftId) => {
        const state = get();
        // Si el turno cambió o se cerró, limpiamos ventas locales
        if (state.currentShiftId !== shiftId) {
          set({ todaySales: [], currentShiftId: shiftId });
        }
      },

      addSale: async (sale, shiftId) => {
        const vendorName = useAuthStore.getState().vendorName;
        
        // Guardar localmente
        set((state) => ({ todaySales: [sale, ...state.todaySales] }));

        // Enviar a Supabase
        try {
          await api.post('/sales', {
            total: sale.total,
            vendorName: vendorName,
            shiftId: shiftId,
            items: sale.items.map(item => ({
              productId: item.productId,
              name: item.product?.name,
              emoji: item.product?.emoji,
              price: item.price
            }))
          });
        } catch (error) {
          console.error('❌ Error de sincronización:', error);
        }
      },
      clearSales: () => set({ todaySales: [], currentShiftId: null }),
    }),
    { name: 'dulcemar-sales' }
  )
);
