import { create } from 'zustand';
import axios from 'axios';
import { useSalesStore } from './salesStore';

interface Shift {
  id: string;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
}

interface ShiftState {
  currentShift: Shift | null;
  isLoading: boolean;
  fetchCurrentShift: () => Promise<void>;
  openShift: (vendorName: string) => Promise<void>;
  closeShift: (vendorName: string) => Promise<void>;
}

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const useShiftStore = create<ShiftState>((set) => ({
  currentShift: null,
  isLoading: true,
  fetchCurrentShift: async () => {
    try {
      const { data } = await api.get('/shifts/current');
      set({ currentShift: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  openShift: async (vendorName) => {
    const { data } = await api.post('/shifts/open', { vendorName });
    // Limpiar ventas locales para empezar turno de 0
    useSalesStore.getState().clearSales();
    set({ currentShift: data });
  },
  closeShift: async (vendorName) => {
    await api.post('/shifts/close', { vendorName });
    // Limpiar ventas locales al cerrar
    useSalesStore.getState().clearSales();
    set({ currentShift: null });
  }
}));
