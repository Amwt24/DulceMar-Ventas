import { create } from 'zustand';
import axios from 'axios';
import { useSalesStore } from './salesStore';

// Forzamos que la API use el prefijo /api para Nginx
const API_URL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: API_URL });

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
    useSalesStore.getState().clearSales();
    set({ currentShift: data });
  },
  closeShift: async (vendorName) => {
    await api.post('/shifts/close', { vendorName });
    useSalesStore.getState().clearSales();
    set({ currentShift: null });
  }
}));
