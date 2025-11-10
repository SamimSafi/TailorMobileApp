import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

console.log('🚀 [STARTUP] api.js - Module loading...');

// Create axios client - baseURL will be set dynamically (NO DEFAULT)
let apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('🚀 [STARTUP] api.js - Axios client created');

/**
 * Initialize API client with stored server configuration
 * MUST be called once when app starts, before any API calls
 * Configuration MUST be set by user in ServerSetupScreen first
 * 
 * Can be called multiple times - will re-read from AsyncStorage if baseURL is not set
 */
export const initializeApiClient = async () => {
  console.log('🚀 [STARTUP] initializeApiClient() called');
  
  // Skip if already initialized with a valid URL
  if (apiClient.defaults.baseURL) {
    console.log('✅ [STARTUP] API Client already initialized with URL:', apiClient.defaults.baseURL);
    return;
  }

  try {
    console.log('🚀 [STARTUP] initializeApiClient - Reading SERVER_URL from AsyncStorage...');
    const storedUrl = await AsyncStorage.getItem('SERVER_URL');
    console.log('🚀 [STARTUP] initializeApiClient - Retrieved storedUrl:', storedUrl);
    
    if (storedUrl) {
      apiClient.defaults.baseURL = storedUrl;
      console.log('✅ [STARTUP] API Client initialized with user-configured URL:', storedUrl);
    } else {
      console.warn('⚠️ [STARTUP] No stored server URL found. User must configure server in setup screen first.');
      // Do NOT set a default - app requires user configuration
    }
  } catch (error) {
    console.error('❌ [STARTUP] Error initializing API client:', error);
    // Do NOT fallback to any default - require user configuration
  }
};

/**
 * Update the API client base URL dynamically
 * Use this when user changes the server configuration
 */
export const updateApiBaseUrl = (newUrl) => {
  try {
    apiClient.defaults.baseURL = newUrl;
    console.log('✓ API base URL updated to:', newUrl);
  } catch (error) {
    console.error('✗ Error updating API base URL:', error);
  }
};

/**
 * Force re-initialize API client from AsyncStorage
 * Use this after user completes server setup
 */
export const forceReinitializeApiClient = async () => {
  try {
    // Clear current baseURL to force re-read
    apiClient.defaults.baseURL = null;
    console.log('Forcing API client reinitialization...');
    
    // Re-read from AsyncStorage
    await initializeApiClient();
    
    if (apiClient.defaults.baseURL) {
      console.log('✓ API client reinitialized with URL:', apiClient.defaults.baseURL);
      return true;
    } else {
      console.warn('⚠ Reinitialization failed - no URL configured');
      return false;
    }
  } catch (error) {
    console.error('✗ Error reinitializing API client:', error);
    return false;
  }
};

// Add token to requests AND ensure API is initialized
apiClient.interceptors.request.use(async (config) => {
  console.log('🚀 [API] Request interceptor triggered for:', config.url);
  try {
    // Safety check: Ensure baseURL is set before making request
    if (!config.baseURL && !apiClient.defaults.baseURL) {
      console.warn('⚠️ [API] API not yet initialized, attempting initialization...');
      await initializeApiClient();
      
      // If still no baseURL after initialization, throw error
      if (!apiClient.defaults.baseURL) {
        throw new Error('Server not configured. Please configure server URL in settings first.');
      }
    }

    // Add token if available
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🚀 [API] Token added to request headers');
    }
  } catch (error) {
    console.error('❌ [API] Error in request interceptor:', error.message);
    throw error;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('🚀 [API] Response received from:', response.config.url);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.error('❌ [API] API Error:', message);
    throw new Error(message);
  }
);

/**
 * Fetch customers with search, pagination, and sorting
 * Endpoint: GET /v1/customers
 * @param {string} searchTerm - Search term for customer name or phone
 * @param {number} pageSize - Number of results per page (default: 20)
 * @param {number} pageIndex - Page index starting from 0 (default: 0)
 * @param {string} sortBy - Field to sort by: customerName, serialNumber, createdAt, updatedAt, lastActivity, balance (default: createdAt)
 * @param {string} sortOrder - Sort order: ASC or DESC (default: DESC)
 */
export const searchCustomers = (
  searchTerm = '',
  pageSize = 20,
  pageIndex = 0,
  sortBy = 'createdAt',
  sortOrder = 'DESC'
) =>
  apiClient.get('/v1/customers', {
    params: {
      search: searchTerm || '',
      pageSize,
      pageIndex,
      sortBy,
      sortOrder,
    },
  });

/**
 * Create a new customer
 * Endpoint: POST /customers
 * @param {object} customerData - Customer information
 * @param {string} customerData.customerName - Customer name
 * @param {string} customerData.name - Additional name field
 * @param {string} customerData.phoneNumber - Phone number
 * @param {string} customerData.phone - Alternative phone field
 * @param {string} customerData.address - Customer address
 * @param {number} customerData.balance - Initial balance
 * @param {string} customerData.notes - Optional notes
 */
export const createCustomer = (customerData) =>
  apiClient.post('/v1/customers', customerData);

/**
 * Get customer details by ID
 * Endpoint: GET /v1/customers/{customerId}
 */
export const getCustomer = (customerId) =>
  apiClient.get(`/v1/customers/${customerId}`);

/**
 * Get QAD Andams for a customer
 * Endpoint: GET /v1/qad-andam/customer/{customerId}
 */
export const getQadAndams = (customerId) =>
  apiClient.get(`/v1/qad-andam/customer/${customerId}`);

/**
 * Create a new QAD Andam for a customer
 * Endpoint: POST /qad-andam
 * @param {object} qadAndamData - QAD Andam information
 * @param {string} qadAndamData.customerId - Customer ID
 * @param {string} qadAndamData.qadAndamType - Type: Kala, Darishi, Waskat, Kurti
 * @param {object} qadAndamData.measurements - Measurement object with all field values
 * @param {number} qadAndamData.totalAmount - Total amount
 * @param {number} qadAndamData.paidAmount - Paid amount
 * @param {number} qadAndamData.joraCount - Number of pieces
 * @param {string} qadAndamData.dueDate - Due date (ISO string)
 * @param {string} qadAndamData.description - Optional description
 * @param {string} qadAndamData.returnDate - Optional return date
 * @param {string} qadAndamData.enterDate - Optional enter date
 */
export const createQadAndam = (qadAndamData) =>
  apiClient.post('/v1/qad-andam', qadAndamData);

/**
 * Create invoice for existing QAD Andam
 * Endpoint: POST /v1/qad-andam/invoice
 */
export const createInvoice = (invoiceData) =>
  apiClient.post('/v1/qad-andam/invoice', invoiceData);

/**
 * Get customer balance
 * Endpoint: GET /v1/customers/{customerId}/balance
 */
export const getCustomerBalance = (customerId) =>
  apiClient.get(`/v1/customers/${customerId}/balance`);

/**
 * Get invoices for a customer
 * Endpoint: GET /v1/qad-andam/invoices/customer/{customerId}
 */
export const getInvoicesByCustomer = (customerId) =>
  apiClient.get(`/v1/qad-andam/invoices/customer/${customerId}`);

/**
 * Record a payment for an invoice
 * Endpoint: POST /v1/customers/payments
 * @param {object} paymentData - Payment details
 * @param {number} paymentData.invoiceId - Invoice ID
 * @param {string} paymentData.customerId - Customer ID
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.paymentMethod - Payment method (cash, card, etc)
 * @param {string} paymentData.notes - Optional payment notes
 */
export const recordPayment = (paymentData) =>
  apiClient.post('/v1/customers/payments', paymentData);

/**
 * Log message (SMS) sent to customer
 * Endpoint: POST /v1/messages/log
 * @param {object} messageData - Message details
 * @param {string} messageData.customerId - Customer ID
 * @param {string} messageData.phoneNumber - Customer phone number
 * @param {string} messageData.messageContent - Message text
 * @param {string} messageData.templateName - Template name (optional)
 * @param {string} messageData.status - Message status (sent, failed, etc)
 * @param {string} messageData.sentAt - Timestamp when message was sent
 * @param {string} messageData.messageType - Type of message (SMS, etc)
 */
export const logMessageHistory = (messageData) =>
  apiClient.post('/v1/messages/log', messageData);

/**
 * Get message history for a customer
 * Endpoint: GET /v1/messages/customer/{customerId}
 * @param {string} customerId - Customer ID
 */
export const getMessageHistory = (customerId) =>
  apiClient.get(`/v1/messages/customer/${customerId}`);

/**
 * Get all messages sent (admin)
 * Endpoint: GET /v1/messages
 * @param {object} options - Query options
 * @param {number} options.pageSize - Number of results per page
 * @param {number} options.pageIndex - Page index
 * @param {string} options.startDate - Start date filter (optional)
 * @param {string} options.endDate - End date filter (optional)
 */
export const getAllMessages = (pageSize = 20, pageIndex = 0, startDate, endDate) => {
  const params = { pageSize, pageIndex };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  return apiClient.get('/v1/messages', { params });
};

export default apiClient;

