import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import SimInfo from 'react-native-sim-info';
import { getActiveSIMInfoList, getAllPhoneNumbers } from 'react-native-simcard-info';

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
        PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS, // To read actual phone numbers
      ];

      // Try to add optional permissions if available
      if (PermissionsAndroid.PERMISSIONS.READ_CONTACTS) {
        permissions.push(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
      }

      console.log('Requesting SMS permissions:', permissions);
      const result = await PermissionsAndroid.requestMultiple(permissions);

      console.log('Permission results:', result);

      // Check if all critical permissions are granted
      const sendSmsGranted = result[PermissionsAndroid.PERMISSIONS.SEND_SMS] === PermissionsAndroid.RESULTS.GRANTED;
      const readPhoneGranted = result[PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE] === PermissionsAndroid.RESULTS.GRANTED;
      const readPhoneNumbersGranted = result[PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS] === PermissionsAndroid.RESULTS.GRANTED;

      console.log('Permission summary:', { sendSmsGranted, readPhoneGranted, readPhoneNumbersGranted });

      if (sendSmsGranted && readPhoneGranted) {
        console.log('✓ Critical SMS permissions granted');
        return true;
      } else {
        console.warn('SMS permissions denied:', { sendSmsGranted, readPhoneGranted, readPhoneNumbersGranted });
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
      this.availableSims = [];

      // Primary: Try react-native-simcard-info for SIM display info (best data)
      try {
        console.log('📱 Attempting SIM detection via react-native-simcard-info...');
        
        const [activeSimList, phoneNumbers] = await Promise.all([
          getActiveSIMInfoList(),
          getAllPhoneNumbers(),
        ]);
        
        console.log('📱 react-native-simcard-info - activeSimList:', activeSimList);
        console.log('📱 react-native-simcard-info - phoneNumbers:', phoneNumbers);

        if (activeSimList && Array.isArray(activeSimList) && activeSimList.length > 0) {
          this.availableSims = activeSimList.map((sim, index) => {
            // Try all possible field names for carrier info
            const carrierName = 
              sim.carrierName || 
              sim.carrier || 
              sim.displayName || 
              sim.simOperatorName || 
              sim.operatorName ||
              `SIM ${index + 1}`;
            
            // Try all possible field names for phone number
            const phoneNumber = 
              phoneNumbers?.[index] || 
              sim.number || 
              sim.phoneNumber || 
              sim.phone || 
              sim.line1Number || 
              sim.line1 ||
              sim.msisdn ||
              sim.mdn ||
              sim.primaryNumber ||
              sim.mobileNumber ||
              sim.displayNumber ||
              sim.telNumber ||
              sim.devicePhoneNumber ||
              sim.nativePhoneNumber ||
              '';
            
            console.log(`📱 Mapping SIM ${index}:`, { 
              carrierName, 
              phoneNumber, 
              simCarrierName: sim.carrierName,
              simNumber: sim.number,
              simPhone: sim.phoneNumber,
              allSimData: sim
            });
            
            return {
              id: index,
              name: carrierName,
              phoneNumber: phoneNumber,
              simSlot: index,
              isReady: true,
              isActive: true,
              subscriptionId: sim.subscriptionId,
              carrierName: carrierName,
              iccId: sim.iccId || sim.iccid || '',
              mcc: sim.mcc || '',
              mnc: sim.mnc || '',
              countryIso: sim.countryIso || sim.countryCode || 'AF',
            };
          });
          console.log('✓ Successfully detected SIMs via react-native-simcard-info:', this.availableSims);
          return this.availableSims;
        } else {
          console.warn('⚠ react-native-simcard-info returned empty results');
        }
      } catch (simCardInfoError) {
        console.warn('⚠ react-native-simcard-info failed:', simCardInfoError.message);
      }

      // Secondary: Try react-native-sim-info
      try {
        console.log('📱 Attempting SIM detection via react-native-sim-info (fallback)...');
        const simSlots = await SimInfo.getAllSimSlots();
        console.log('📱 SimInfo result:', simSlots);

        if (simSlots && Array.isArray(simSlots) && simSlots.length > 0) {
          this.availableSims = simSlots.map((sim, index) => {
            // Try all possible field names for carrier info
            const carrierName = 
              sim.carrierName || 
              sim.carrier || 
              sim.displayName || 
              sim.simOperatorName || 
              sim.operatorName ||
              `SIM Slot ${index + 1}`;
            
            // Try all possible field names for phone number
            const phoneNumber = 
              sim.number || 
              sim.phoneNumber || 
              sim.phone || 
              sim.line1Number || 
              sim.line1 ||
              sim.msisdn ||
              sim.mdn ||
              sim.primaryNumber ||
              sim.mobileNumber ||
              sim.displayNumber ||
              sim.telNumber ||
              sim.devicePhoneNumber ||
              sim.nativePhoneNumber ||
              '';
            
            return {
              id: sim.slotIndex !== undefined ? sim.slotIndex : index,
              name: carrierName,
              phoneNumber: phoneNumber,
              simSlot: sim.slotIndex !== undefined ? sim.slotIndex : index,
              isReady: sim.isReady === true,
              isActive: sim.isActive === true,
              carrierName: carrierName,
              countryIso: sim.countryIso || 'AF',
              subscriptionId: sim.subscriptionId,
              iccId: sim.iccId || '',
              mcc: sim.mcc || '',
              mnc: sim.mnc || '',
            };
          });
          console.log('✓ Detected SIMs via react-native-sim-info:', this.availableSims);
          return this.availableSims;
        } else {
          console.warn('⚠ SimInfo returned empty results');
        }
      } catch (simInfoError) {
        console.warn('⚠ react-native-sim-info failed:', simInfoError.message);
      }

      // Tertiary: Try SmsModule for SIM detection (as additional fallback)
      if (SmsModule && typeof SmsModule.getAvailableSims === 'function') {
        try {
          console.log('📱 Attempting SIM detection via SmsModule (fallback)...');
          const simInfo = await SmsModule.getAvailableSims();
          console.log('📱 SmsModule result:', simInfo);

          if (simInfo && Array.isArray(simInfo) && simInfo.length > 0) {
            this.availableSims = simInfo.map((sim, index) => {
              // Try all possible field names for carrier info
              const carrierName = 
                sim.carrierName || 
                sim.carrier || 
                sim.displayName || 
                sim.displayname || 
                sim.simOperatorName || 
                sim.operatorName ||
                `SIM Slot ${index + 1}`;
              
              // Try all possible field names for phone number
              const phoneNumber = 
                sim.number || 
                sim.phone || 
                sim.phoneNumber || 
                sim.line1Number || 
                sim.line1 ||
                sim.msisdn ||
                sim.mdn ||
                sim.primaryNumber ||
                sim.mobileNumber ||
                sim.displayNumber ||
                sim.telNumber ||
                sim.devicePhoneNumber ||
                sim.nativePhoneNumber ||
                '';
              
              return {
                id: sim.slotIndex !== undefined ? sim.slotIndex : index,
                name: carrierName,
                phoneNumber: phoneNumber,
                simSlot: sim.slotIndex !== undefined ? sim.slotIndex : index,
                isReady: sim.isReady !== false,
                isActive: sim.isActive !== false,
                subscriptionId: sim.subscriptionId,
                carrierName: carrierName,
                iccId: sim.iccId || '',
                mcc: sim.mcc || '',
                mnc: sim.mnc || '',
                countryIso: sim.countryIso || 'AF',
              };
            });
            console.log('✓ Successfully detected SIMs via SmsModule:', this.availableSims);
            return this.availableSims;
          } else {
            console.warn('⚠ SmsModule returned empty results');
          }
        } catch (smsModuleError) {
          console.warn('⚠ SmsModule detection failed:', smsModuleError.message);
        }
      }

      // Final Fallback: return default SIM options (supports up to 2 SIM slots)
      if (this.availableSims.length === 0) {
        console.warn('⚠ No SIM detection available. Using default SIM configuration.');
        
        // Default to dual-SIM support (most common on Android devices)
        this.availableSims = [
          {
            id: 0,
            name: 'SIM Slot 1 (Primary)',
            phoneNumber: '',
            simSlot: 0,
            isReady: true,
            isActive: true,
            carrierName: 'Unknown Carrier',
            countryIso: 'AF',
            iccId: '',
            mcc: '',
            mnc: '',
          },
          {
            id: 1,
            name: 'SIM Slot 2 (Secondary)',
            phoneNumber: '',
            simSlot: 1,
            isReady: false,
            isActive: false,
            carrierName: 'Unknown Carrier',
            countryIso: 'AF',
            iccId: '',
            mcc: '',
            mnc: '',
          },
        ];
      }

      console.log('✓ Final SIM list:', this.availableSims);
      return this.availableSims;
    } catch (error) {
      console.error('✗ Error detecting SIMs:', error);
      // Fallback to dual-SIM options
      console.warn('⚠ Returning default SIM options due to error');
      return [
        {
          id: 0,
          name: 'SIM Slot 1 (Primary)',
          phoneNumber: '',
          simSlot: 0,
          isReady: true,
          isActive: true,
          carrierName: 'Unknown Carrier',
          countryIso: 'AF',
          iccId: '',
          mcc: '',
          mnc: '',
        },
        {
          id: 1,
          name: 'SIM Slot 2 (Secondary)',
          phoneNumber: '',
          simSlot: 1,
          isReady: false,
          isActive: false,
          carrierName: 'Unknown Carrier',
          countryIso: 'AF',
          iccId: '',
          mcc: '',
          mnc: '',
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
    // For Afghanistan: 93
    if (cleaned.startsWith('0')) {
      return '+93' + cleaned.substring(1);
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

export const getAvailableSims = async () => {
  try {
    const sims = await nativeSmsService.detectAvailableSims();
    console.log('✅ getAvailableSims export returning:', sims);
    return sims;
  } catch (error) {
    console.error('❌ getAvailableSims export error:', error);
    throw error;
  }
};

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