import { Linking, Platform } from 'react-native';
import apiClient from './api';

/**
 * Check if SMS is available on device
 */
export const checkSmsAvailability = async () => {
  try {
    // SMS is always available on mobile devices
    return Platform.OS === 'android' || Platform.OS === 'ios';
  } catch (error) {
    console.error('Error checking SMS availability:', error);
    return false;
  }
};

/**
 * Format phone number for SMS URI
 * Removes all non-numeric characters except + at the start
 */
const formatPhoneForSms = (phoneNumber) => {
  if (!phoneNumber) return '';
  // Remove all non-numeric characters except leading +
  return phoneNumber.replace(/[^0-9+]/g, '').replace(/\+(?=.*\+)/g, '');
};

/**
 * Send SMS to a customer using native SMS app
 * Opens the device's default SMS app with pre-filled message
 * User can select which SIM to use on dual-SIM devices
 * 
 * @param {string} phoneNumber - Customer phone number
 * @param {string} message - Message content
 * @param {string} customerId - Customer ID (for logging)
 * @param {string} templateName - Template name used (optional)
 */
export const sendSmsToCustomer = async (phoneNumber, message, customerId, templateName = null) => {
  try {
    // Validate inputs
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new Error('Invalid phone number');
    }

    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    // Format phone number for SMS URI
    const formattedPhone = formatPhoneForSms(phoneNumber);
    if (!formattedPhone) {
      throw new Error('Phone number contains no digits');
    }

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);

    // Create SMS URI - works on both iOS and Android
    const smsUri = Platform.OS === 'ios'
      ? `sms://${formattedPhone}?body=${encodedMessage}`
      : `sms:${formattedPhone}?body=${encodedMessage}`;

    // Log the action
    console.log(`📱 Opening SMS app for: ${phoneNumber}`);
    console.log(`✉️ Message length: ${message.length} characters`);

    // Open native SMS app
    await Linking.openURL(smsUri);

    // Log message to database for history/audit
    // We log it as "pending" because user will confirm in native app
    await logMessageHistory({
      customerId,
      phoneNumber,
      message,
      templateName,
      status: 'pending', // Will be marked as sent after user confirms in SMS app
      sentAt: new Date().toISOString(),
    });

    return { 
      success: true, 
      message: 'SMS app opened. Confirm sending in the native SMS application.' 
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to open SMS app: ${error.message}`);
  }
};

/**
 * Send SMS to multiple customers
 * Opens SMS app for each customer sequentially
 * User must confirm each message in the native SMS app
 * 
 * @param {array} customers - Array of customer objects with phoneNumber and customerId
 * @param {string} message - Message content
 * @param {string} templateName - Template name used (optional)
 */
export const sendSmsToMultipleCustomers = async (customers, message, templateName = null) => {
  const results = [];
  
  for (const customer of customers) {
    try {
      const result = await sendSmsToCustomer(
        customer.phoneNumber,
        message,
        customer.customerId,
        templateName
      );
      results.push({
        customerId: customer.customerId,
        phoneNumber: customer.phoneNumber,
        success: result.success,
        message: result.message,
      });
    } catch (error) {
      console.error(`Failed to open SMS for ${customer.phoneNumber}:`, error);
      results.push({
        customerId: customer.customerId,
        phoneNumber: customer.phoneNumber,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Log message to database for history/audit
 * Endpoint: POST /v1/messages/log
 * Note: This is optional - logging won't prevent SMS sending if it fails
 */
export const logMessageHistory = async (messageData) => {
  try {
    const response = await apiClient.post('/v1/messages/log', {
      customerId: messageData.customerId,
      phoneNumber: messageData.phoneNumber,
      messageContent: messageData.message,
      templateName: messageData.templateName,
      status: messageData.status,
      sentAt: messageData.sentAt,
      messageType: 'SMS',
    });
    console.log('✅ Message logged to backend:', response.data);
    return response;
  } catch (error) {
    console.warn('⚠️ Could not log message to backend (non-critical):', error.message);
    // Don't throw - logging failure shouldn't prevent SMS sending
    return null;
  }
};

/**
 * Get message history for a customer
 * Endpoint: GET /v1/messages/customer/{customerId}
 */
export const getMessageHistory = async (customerId) => {
  try {
    const response = await apiClient.get(`/v1/messages/customer/${customerId}`);
    return response;
  } catch (error) {
    console.error('Error fetching message history:', error);
    throw error;
  }
};