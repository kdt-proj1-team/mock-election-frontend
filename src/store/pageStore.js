import { create } from "zustand";
import { categoryAPI } from "../api/CategoryApi";

const usePageStore = create(set => ({
    page: 0,
  
    setPage: (pageIndex) => set({ page: pageIndex }),
    resetPage: () => set({ page: 0 }),
}));

export default usePageStore;