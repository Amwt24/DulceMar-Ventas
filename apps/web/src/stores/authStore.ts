import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  vendorName: string | null;
  setVendor: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      vendorName: null,
      setVendor: (name) => set({ vendorName: name }),
      logout: () => set({ vendorName: null }),
    }),
    { name: 'dulcemar-auth' }
  )
);
