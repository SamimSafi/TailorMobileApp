import { create } from 'zustand';
import { searchCustomers } from '../services/api';

export const useSearchStore = create((set) => ({
  searchResults: [],
  loading: false,
  error: null,
  searchTerm: '',

  setSearchTerm: (term) => set({ searchTerm: term }),

  searchCustomer: async (searchTerm) => {
    set({ loading: true, error: null });
    try {
      const response = await searchCustomers(searchTerm);
      set({ searchResults: response.data.data || response.data });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  clearSearch: () => set({ searchResults: [], error: null, searchTerm: '' }),
}));

