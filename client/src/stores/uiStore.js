import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: false,
  networkError: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (val) => set({ sidebarOpen: val }),
  setNetworkError: (val) => set({ networkError: val }),
}));

export default useUiStore;
