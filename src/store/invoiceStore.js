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
      const response = await createInvoice({
        customerId,
        qadAndamId,
        totalAmount: parseFloat(invoiceData.totalAmount),
        paidAmount: parseFloat(invoiceData.paidAmount),
        dueDate: invoiceData.dueDate,
        returnDate: invoiceData.returnDate,
        joraCount: parseInt(invoiceData.joraCount),
      });
      set({
        success: true,
        createdInvoice: response.data.data || response.data,
      });
      return response.data.data || response.data;
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
}));

