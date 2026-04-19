import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  filters: {
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sortBy: 'newest',
    featuredOnly: false,
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
        minPrice: '',
        maxPrice: '',
        search: '',
        sortBy: 'newest',
        featuredOnly: false,
      },
    });
  },
}));
