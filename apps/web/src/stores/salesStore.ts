import { create } from 'zustand';
import { Sale, SaleItem } from '../types';

interface SalesState {
  todaySales: Sale[];
  isLoading: boolean;
  addSale: (sale: Sale) => Promise<void>;
  fetchTodaySales: () => Promise<void>;
}

export const useSalesStore = create<SalesState>((set) => ({
  todaySales: [],
  isLoading: false,
  addSale: async (sale) => {
    set((state) => ({ todaySales: [sale, ...state.todaySales] }));
    // Offline sync and API logic here
  },
  fetchTodaySales: async () => {
    // API call logic here
  },
}));
