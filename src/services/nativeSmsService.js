import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { SmsModule } = NativeModules;

// SIM Detection and SMS service for native Android
class NativeSmsService {
  constructor() {
    this.smsAvailable = false;
    this.availableSims = [];
  }

  /**
   * Request SMS permissions from user
   */
  async requestSmsPermissions() {
    if (Platform.OS !== 'android') {
      console.log('✓ Non-Android platform - SMS available');
      return true;
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      ];

      console.log('Requesting SMS permissions:', permissions);
      const result = await PermissionsAndroid.requestMultiple(permissions);

      console.log('Permission results:', result);

      // Check if all critical permissions are granted
      const sendSmsGranted = result[PermissionsAndroid.PERMISSIONS.SEND_SMS] === PermissionsAndroid.RESULTS.GRANTED;
      const readPhoneGranted = result[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === PermissionsAndroid.RESULTS.GRANTED;

      if (sendSmsGranted && readPhoneGranted) {
        console.log('✓ Critical SMS permissions granted');
        return true;
      } else {
        console.warn('SMS permissions denied:', { sendSmsGranted, readPhoneGranted });
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      return false;
    }
  }

  /**
   * Check if SMS is available on the device
   */
  async checkSmsAvailability() {
    try {
      console.log('Checking SMS availability...');

      if (Platform.OS !== 'android') {
        console.log('✓ Non-Android platform - SMS considered available');
        this.smsAvailable = true;
        return true;
      }

      // Check if SmsModule is available
      if (!SmsModule) {
        console.error('✗ SmsModule not available - SMS cannot be sent');
        this.smsAvailable = false;
        return false;
      }

      console.log('✓ SmsModule is available');

      // Request necessary permissions
      const hasPermission = await this.requestSmsPermissions();

      if (!hasPermission) {
        console.warn('✗ SMS permissions not granted - user needs to allow permissions');
        this.smsAvailable = false;
        return false;
      }

      console.log('✓ SMS permissions granted');
      this.smsAvailable = true;

      // Attempt to detect SIMs while checking availability
      try {
        await this.detectAvailableSims();
      } catch (simError) {
        console.warn('Could not detect SIMs, but SMS may still work:', simError.message);
      }

      return true;
    } catch (error) {
      console.error('Error checking SMS availability:', error);
      this.smsAvailable = false;
      return false;
    }
  }

  /**
   * Get available SIMs on the device
   * Detects single and dual-SIM devices
   */
  async detectAvailableSims() {
    try {
      if (Platform.OS !== 'android') {
        console.log('Non-Android platform - returning default SIM');
        return [{ id: 0, name: 'Device SIM', phoneNumber: '', simSlot: 0, isReady: true }];
      }

      console.log('🔍 Detecting available SIM cards...');

      // First, try native SIM detection modules
      this.availableSims = [];

      // Primary: Try SmsModule for SIM detection (most reliable)
      try {
        if (SmsModule && typeof SmsModule.getAvailableSims === 'function') {
          console.log('📱 SmsModule found, attempting SIM detection...');
          const simInfo = await SmsModule.getAvailableSims();
          console.log('📱 SmsModule result:', simInfo);

          if (simInfo && Array.isArray(simInfo) && simInfo.length > 0) {
            this.availableSims = simInfo.map((sim, index) => ({
              id: index,
              name: sim.displayName || sim.displayname || `SIM ${index + 1}`,
              phoneNumber: sim.phone || sim.phoneNumber || '',
              simSlot: sim.slotIndex || index,
              isReady: sim.isReady !== false,
              isActive: sim.isActive !== false,
              subscriptionId: sim.subscriptionId,
            }));
            console.log('✓ Detected SIMs via SmsModule:', this.availableSims);
            return this.availableSims;
          } else {
            console.warn('⚠ SmsModule returned empty results');
          }
        } else {
          console.warn('⚠ SmsModule.getAvailableSims not available');
        }
      } catch (error) {
        console.warn('⚠ SmsModule SIM detection failed:', error.message);
      }

      // Fallback: Try SimSlotModule for SIM detection
      try {
        if (NativeModules.SimSlotModule && typeof NativeModules.SimSlotModule.getSimSlots === 'function') {
          console.log('📱 SimSlotModule found, attempting SIM detection...');
          const simInfo = await NativeModules.SimSlotModule.getSimSlots();
          console.log('📱 SimSlotModule result:', simInfo);

          if (simInfo && Array.isArray(simInfo) && simInfo.length > 0) {
            this.availableSims = simInfo.map((sim, index) => ({
              id: index,
              name: sim.name || `SIM Slot ${index + 1}${sim.isReady ? ' (Ready)' : ' (Not Ready)'}`,
              phoneNumber: sim.phoneNumber && sim.phoneNumber !== 'Unknown' ? sim.phoneNumber : '',
              simSlot: index,
              isReady: sim.isReady === true,
              isActive: sim.isActive === true,
            }));
            console.log('✓ Detected SIMs via SimSlotModule:', this.availableSims);
            return this.availableSims;
          }
        }
      } catch (error) {
        console.warn('⚠ SimSlotModule not available:', error.message);
      }

      // Fallback: return default single SIM option
      if (this.availableSims.length === 0) {
        console.warn('⚠ No native SIM detection available, using default SIM configuration');
        this.availableSims = [
          {
            id: 0,
            name: 'Device SIM',
            phoneNumber: '',
            simSlot: 0,
            isReady: true,
            isActive: true,
          },
        ];
      }

      console.log('✓ Final SIM list:', this.availableSims);
      return this.availableSims;
    } catch (error) {
      console.error('✗ Error detecting SIMs:', error);
      // Fallback to single SIM
      console.warn('⚠ Returning default SIM due to error');
      return [
        {
          id: 0,
          name: 'Device SIM',
          phoneNumber: '',
          simSlot: 0,
          isReady: true,
          isActive: true,
        },
      ];
    }
  }

  /**
   * Send SMS to a single customer
   * @param {string} phoneNumber - Recipient phone number
   * @param {string} message - Message content
   * @param {string} customerId - Customer ID for logging
   * @param {string} templateId - Template ID for logging
   * @param {number} simSlot - SIM slot to use (default: 0)
   */
  async sendSmsToCustomer(
    phoneNumber,
    message,
    customerId,
    templateId = null,
    simSlot = 0
  ) {
    try {
      console.log('Starting SMS send process...', { phoneNumber, simSlot });

      // Ensure SMS is available
      if (!this.smsAvailable) {
        console.log('SMS not marked as available, checking now...');
        await this.checkSmsAvailability();
      }

      if (!this.smsAvailable) {
        throw new Error('SMS is not available on this device. Please check permissions and device configuration.');
      }

      // Validate inputs
      if (!phoneNumber || phoneNumber.trim() === '') {
        throw new Error('Phone number is required');
      }

      if (!message || message.trim() === '') {
        throw new Error('Message cannot be empty');
      }

      // Format phone number
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      console.log('Phone number formatted:', formattedNumber);

      // Verify SmsModule is available
      if (!SmsModule) {
        throw new Error('SMS Module not available on this device');
      }

      const simSlotNum = parseInt(simSlot, 10) || 0;
      console.log('Sending SMS via SmsModule...', { formattedNumber, simSlot: simSlotNum });

      // Send SMS with SIM slot support
      try {
        await SmsModule.sendSms(formattedNumber, message, simSlotNum);
        console.log('✓ SMS sent successfully');
      } catch (smsModuleError) {
        console.error('SmsModule.sendSms failed:', smsModuleError);
        throw new Error(`Failed to send SMS via native module: ${smsModuleError.message}`);
      }

      // Log to backend (non-blocking)
      this.logMessageHistory(
        customerId,
        formattedNumber,
        message,
        'sent',
        templateId,
        simSlot
      ).catch(error => {
        console.warn('Failed to log message to backend:', error.message);
      });

      return {
        success: true,
        message: 'SMS sent successfully',
        phoneNumber: formattedNumber,
        timestamp: new Date().toISOString(),
        simSlot: simSlotNum,
      };
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error(error.message || 'Failed to send SMS');
    }
  }

  /**
   * Send SMS to multiple customers
   */
  async sendSmsToMultipleCustomers(
    customers,
    message,
    templateId = null,
    simSlot = 0
  ) {
    const results = [];

    for (const customer of customers) {
      try {
        const result = await this.sendSmsToCustomer(
          customer.phoneNumber,
          message,
          customer.customerId,
          templateId,
          simSlot
        );
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          message: error.message,
          phoneNumber: customer.phoneNumber,
          customerId: customer.customerId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  /**
   * Format phone number for SMS
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';

    // Remove all non-numeric characters except leading +
    const hasPlus = phoneNumber.trim().startsWith('+');
    let cleaned = phoneNumber.replace(/[^\d+]/g, '').replace(/\+/g, '');

    // If original had +, add it back
    if (hasPlus) {
      return '+' + cleaned;
    }

    // If it starts with 0 (local number), replace with country code
    // For Pakistan: 92
    if (cleaned.startsWith('0')) {
      return '+92' + cleaned.substring(1);
    }

    // If it starts with country code without +, add it
    if (!cleaned.startsWith('+') && cleaned.length > 10) {
      return '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Log message to backend
   */
  async logMessageHistory(
    customerId,
    phoneNumber,
    message,
    status = 'pending',
    templateId = null,
    simSlot = 0
  ) {
    try {
      // This would call your backend API
      // For now, just log locally
      const logData = {
        customerId,
        phoneNumber,
        message,
        status,
        templateId,
        simSlot,
        timestamp: new Date().toISOString(),
        messageLength: message.length,
        smsCount: Math.ceil(message.length / 160),
      };

      console.log('SMS Log:', logData);

      // Uncomment to enable backend logging:
      // await fetch('http://your-backend/v1/messages/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData),
      // });

      return logData;
    } catch (error) {
      console.error('Error logging message:', error);
      throw error;
    }
  }

  /**
   * Get message history
   */
  async getMessageHistory(customerId) {
    // This would fetch from backend
    // For now, return empty
    return [];
  }

  /**
   * Get available SIMs for UI selection
   */
  async getSimOptions() {
    try {
      await this.detectAvailableSims();
      return this.availableSims;
    } catch (error) {
      console.error('Error getting SIM options:', error);
      return [];
    }
  }
}

// Export singleton instance
export const nativeSmsService = new NativeSmsService();

// Export individual functions for backward compatibility
export const checkSmsAvailability = () =>
  nativeSmsService.checkSmsAvailability();

export const sendSmsToCustomer = (
  phoneNumber,
  message,
  customerId,
  templateId,
  simSlot
) =>
  nativeSmsService.sendSmsToCustomer(
    phoneNumber,
    message,
    customerId,
    templateId,
    simSlot
  );

export const sendSmsToMultipleCustomers = (
  customers,
  message,
  templateId,
  simSlot
) =>
  nativeSmsService.sendSmsToMultipleCustomers(
    customers,
    message,
    templateId,
    simSlot
  );

export const getAvailableSims = () => nativeSmsService.getSimOptions();

export const logMessageHistory = (
  customerId,
  phoneNumber,
  message,
  status,
  templateId,
  simSlot
) =>
  nativeSmsService.logMessageHistory(
    customerId,
    phoneNumber,
    message,
    status,
    templateId,
    simSlot
  );

export const getMessageHistory = (customerId) =>
  nativeSmsService.getMessageHistory(customerId);