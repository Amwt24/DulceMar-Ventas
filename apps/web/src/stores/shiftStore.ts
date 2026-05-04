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
  pollingInterval: ReturnType<typeof setInterval> | null;
  fetchCurrentShift: () => Promise<void>;
  openShift: (vendorName: string) => Promise<void>;
  closeShift: (vendorName: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: null,
  isLoading: true,
  pollingInterval: null,

  fetchCurrentShift: async () => {
    try {
      const { data } = await api.get('/shifts/current');
      const prev = get().currentShift;
      // Solo limpiar ventas si había un turno previo Y el turno realmente cambió.
      // Si prev es null (recarga de página), NO limpiar: las ventas del localStorage son válidas.
      if (prev !== null && prev?.id !== data?.id) {
        useSalesStore.getState().clearSales();
      }
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
  },

  startPolling: () => {
    const { pollingInterval, fetchCurrentShift } = get();
    if (pollingInterval) return; // Ya hay polling activo
    const interval = setInterval(() => {
      fetchCurrentShift();
    }, 30000); // Cada 30 segundos
    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },
}));

