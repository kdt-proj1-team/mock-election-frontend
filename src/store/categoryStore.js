import { create } from "zustand";
import { categoryAPI } from "../api/CategoryApi";

const useCategoryStore = create((set) => ({
    categories: [],
    selectedCategory: null,
  
    // 카테고리 목록 API 호출 후 저장
    fetchCategories: async () => {
      try {
        const data = await categoryAPI.getCategoriesByIsActive();
        set({ categories: data });
      } catch (error) {
        console.error("카테고리 조회 실패:", error);
      }
    },
  
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    clearSelectedCategory: () => set({ selectedCategory: null }),
  }));

export default useCategoryStore;