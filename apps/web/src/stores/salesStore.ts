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
  pendingSync: (Sale & { shiftId: string; vendorName: string })[]; // Cola offline
  currentShiftId: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  addSale: (sale: Sale, shiftId: string) => Promise<void>;
  syncPending: () => Promise<void>;
  syncWithShift: (shiftId: string | null) => void;
  clearSales: () => void;
}

const postSaleToApi = async (
  sale: Sale & { shiftId: string; vendorName: string }
) => {
  await api.post('/sales', {
    total: sale.total,
    vendorName: sale.vendorName,
    shiftId: sale.shiftId,
    items: sale.items.map((item) => ({
      productId: item.productId,
      name: item.product?.name,
      emoji: item.product?.emoji,
      price: item.price,
    })),
  });
};

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      todaySales: [],
      pendingSync: [],
      currentShiftId: null,
      isLoading: false,
      isSyncing: false,

      syncWithShift: (shiftId) => {
        const state = get();
        // Si el turno cambió o se cerró, limpiamos ventas locales
        if (state.currentShiftId !== shiftId) {
          set({ todaySales: [], currentShiftId: shiftId });
        }
      },

      addSale: async (sale, shiftId) => {
        const vendorName = useAuthStore.getState().vendorName ?? 'unknown';

        // 1. Guardar localmente SIEMPRE (visible en dashboard instantáneamente)
        set((state) => ({ todaySales: [sale, ...state.todaySales] }));

        // 2. Intentar enviar a Supabase
        const saleWithMeta = { ...sale, shiftId, vendorName };
        try {
          await postSaleToApi(saleWithMeta);
        } catch (error) {
          // Sin conexión → encolar para sincronizar después
          console.warn('⚠️ Sin conexión. Venta guardada offline.', error);
          set((state) => ({
            pendingSync: [...state.pendingSync, saleWithMeta],
          }));
        }
      },

      syncPending: async () => {
        const { pendingSync, isSyncing } = get();
        if (isSyncing || pendingSync.length === 0) return;

        set({ isSyncing: true });
        const failed: typeof pendingSync = [];

        for (const sale of pendingSync) {
          try {
            await postSaleToApi(sale);
          } catch {
            // Todavía sin conexión, mantener en cola
            failed.push(sale);
          }
        }

        set({ pendingSync: failed, isSyncing: false });
        if (failed.length < pendingSync.length) {
          const synced = pendingSync.length - failed.length;
          console.log(`✅ ${synced} venta(s) sincronizada(s) correctamente.`);
        }
      },

      clearSales: () => set({ todaySales: [], currentShiftId: null }),
    }),
    {
      name: 'dulcemar-sales',
      // Persistir también la cola pendiente para sobrevivir recargas
      partialize: (state) => ({
        todaySales: state.todaySales,
        pendingSync: state.pendingSync,
        currentShiftId: state.currentShiftId,
      }),
    }
  )
);
