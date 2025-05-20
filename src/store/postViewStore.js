import { create } from "zustand";

const useViewStore = create((set) => ({
  isCardView: false,
  setCardView: (value) => set({ isCardView: value }),
}));

export default useViewStore;