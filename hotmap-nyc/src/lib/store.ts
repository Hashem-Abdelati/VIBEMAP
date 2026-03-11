// src/lib/store.ts
import { create } from 'zustand';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
    window.location.href = '/';
  },
}));

interface MapStore {
  selectedPlaceId: string | null;
  showPingModal: boolean;
  pingTargetPlaceId: string | null;
  filters: {
    categories: string[];
    showTrending: boolean;
  };
  setSelectedPlace: (id: string | null) => void;
  openPingModal: (placeId: string) => void;
  closePingModal: () => void;
  toggleCategory: (cat: string) => void;
  setShowTrending: (show: boolean) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  selectedPlaceId: null,
  showPingModal: false,
  pingTargetPlaceId: null,
  filters: {
    categories: [],
    showTrending: false,
  },
  setSelectedPlace: (id) => set({ selectedPlaceId: id }),
  openPingModal: (placeId) => set({ showPingModal: true, pingTargetPlaceId: placeId }),
  closePingModal: () => set({ showPingModal: false, pingTargetPlaceId: null }),
  toggleCategory: (cat) =>
    set((state) => ({
      filters: {
        ...state.filters,
        categories: state.filters.categories.includes(cat)
          ? state.filters.categories.filter((c) => c !== cat)
          : [...state.filters.categories, cat],
      },
    })),
  setShowTrending: (show) =>
    set((state) => ({ filters: { ...state.filters, showTrending: show } })),
}));
