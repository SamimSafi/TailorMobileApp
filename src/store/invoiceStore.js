import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createInvoice } from '../services/api';

export const useInvoiceStore = create((set, get) => ({
  invoiceData: {
    totalAmount: '',
    paidAmount: '',
    dueDate: '',
    returnDate: '',
    joraCount: '',
  },
  loading: false,
  error: null,
  success: false,
  createdInvoice: null,

  setInvoiceData: (data) => set({ invoiceData: data }),

  setInvoiceField: (field, value) =>
    set((state) => ({
      invoiceData: {
        ...state.invoiceData,
        [field]: value,
      },
    })),

  submitInvoice: async (customerId, qadAndamId) => {
    set({ loading: true, error: null });
    try {
      const invoiceData = get().invoiceData;
      const invoicePayload = {
        customerId,
        qadAndamId,
        totalAmount: parseFloat(invoiceData.totalAmount),
        paidAmount: parseFloat(invoiceData.paidAmount),
        dueDate: invoiceData.dueDate,
        returnDate: invoiceData.returnDate,
        joraCount: parseInt(invoiceData.joraCount),
        createdAt: new Date().toISOString(),
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      // Try to save to server first
      try {
        const response = await createInvoice(invoicePayload);
        set({
          success: true,
          createdInvoice: response.data.data || response.data,
        });
        return response.data.data || response.data;
      } catch (apiError) {
        console.warn('API call failed, saving locally:', apiError.message);
        // Save locally if API fails
        await get().saveInvoiceLocally(invoicePayload);
        set({
          success: true,
          createdInvoice: { ...invoicePayload, isLocal: true },
        });
        return { ...invoicePayload, isLocal: true };
      }
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetForm: () =>
    set({
      invoiceData: {
        totalAmount: '',
        paidAmount: '',
        dueDate: '',
        returnDate: '',
        joraCount: '',
      },
      success: false,
      error: null,
      createdInvoice: null,
    }),

  // Local storage functions
  saveInvoiceLocally: async (invoice) => {
    try {
      const storedInvoices = await AsyncStorage.getItem('LOCAL_INVOICES');
      const invoices = storedInvoices ? JSON.parse(storedInvoices) : [];
      invoices.push(invoice);
      await AsyncStorage.setItem('LOCAL_INVOICES', JSON.stringify(invoices));
    } catch (error) {
      console.error('Failed to save invoice locally:', error);
      throw error;
    }
  },

  getLocalInvoices: async () => {
    try {
      const storedInvoices = await AsyncStorage.getItem('LOCAL_INVOICES');
      return storedInvoices ? JSON.parse(storedInvoices) : [];
    } catch (error) {
      console.error('Failed to get local invoices:', error);
      return [];
    }
  },

  syncLocalInvoices: async () => {
    try {
      const localInvoices = await get().getLocalInvoices();
      if (localInvoices.length === 0) return;

      const syncedInvoices = [];
      for (const invoice of localInvoices) {
        try {
          // Try to sync each local invoice to server
          const response = await createInvoice(invoice);
          syncedInvoices.push(invoice.id);
        } catch (error) {
          console.warn(`Failed to sync invoice ${invoice.id}:`, error.message);
        }
      }

      // Remove synced invoices from local storage
      if (syncedInvoices.length > 0) {
        const remainingInvoices = localInvoices.filter(inv => !syncedInvoices.includes(inv.id));
        await AsyncStorage.setItem('LOCAL_INVOICES', JSON.stringify(remainingInvoices));
      }
    } catch (error) {
      console.error('Failed to sync local invoices:', error);
    }
  },
}));

