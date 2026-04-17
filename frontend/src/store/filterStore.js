import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  filters: {
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    search: '',
    sortBy: 'newest',
  },

  setFilter: (filterName, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [filterName]: value,
      },
    }));
  },

  setFilters: (newFilters) => {
    set({
      filters: newFilters,
    });
  },

  clearFilters: () => {
    set({
      filters: {
        category: '',
        minPrice: 0,
        maxPrice: 1000,
        search: '',
        sortBy: 'newest',
      },
    });
  },
}));
