import { create } from 'zustand';
import { getCustomer, getCustomerBalance, getInvoicesByCustomer, getQadAndams, recordPayment } from '../services/api';

export const useCustomerStore = create((set, get) => ({
  selectedCustomer: null,
  qadAndams: [],
  invoices: [],
  balance: 0,
  loading: false,
  paymentLoading: false,
  error: null,

  selectCustomer: async (customerId) => {
    set({ loading: true, error: null });
    try {
      const [customerRes, qadAndamsRes, balanceRes, invoicesRes] = await Promise.all([
        getCustomer(customerId),
        getQadAndams(customerId),
        getCustomerBalance(customerId),
        getInvoicesByCustomer(customerId),
      ]);

      set({
        selectedCustomer: customerRes.data.data || customerRes.data,
        qadAndams: qadAndamsRes.data.data || qadAndamsRes.data || [],
        invoices: invoicesRes.data.data || invoicesRes.data || [],
        balance: balanceRes.data.data?.balance || 0,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  refreshCustomerData: async (customerId) => {
    if (!customerId) {
      console.warn('⚠ refreshCustomerData called without customerId');
      return;
    }

    const state = get();
    
    // Only prevent if we're already loading the SAME customer
    if (state.loading && state.selectedCustomer?.customerId === customerId) {
      console.log('⚠ Already loading data for this customer, skipping duplicate request');
      return;
    }

    set({ loading: true, error: null });

    try {
      const [customerRes, qadAndamsRes, balanceRes, invoicesRes] = await Promise.all([
        getCustomer(customerId),
        getQadAndams(customerId),
        getCustomerBalance(customerId),
        getInvoicesByCustomer(customerId),
      ]);

      set({
        selectedCustomer: customerRes.data.data || customerRes.data,
        qadAndams: qadAndamsRes.data.data || qadAndamsRes.data || [],
        invoices: invoicesRes.data.data || invoicesRes.data || [],
        balance: balanceRes.data.data?.balance || 0,
        loading: false,
      });
      
      console.log('✓ Customer data refreshed successfully');
    } catch (error) {
      console.error('✗ Error refreshing customer data:', error.message);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  recordPayment: async (paymentData) => {
    set({ paymentLoading: true, error: null });
    try {
      const response = await recordPayment(paymentData);
      const customerId = paymentData.customerId;

      // Refresh all customer data after payment
      await get().refreshCustomerData(customerId);

      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ paymentLoading: false });
    }
  },

  clearCustomer: () =>
    set({
      selectedCustomer: null,
      qadAndams: [],
      invoices: [],
      balance: 0,
      error: null,
      loading: false,
    }),

  setLoading: (value) => set({ loading: value }),
}));

