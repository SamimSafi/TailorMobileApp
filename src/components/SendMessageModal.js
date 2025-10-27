// import { useEffect, useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     Modal,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { MESSAGE_TEMPLATES } from '../constants/messageTemplates';
// import { checkSmsAvailability, sendSmsToCustomer, sendSmsToMultipleCustomers } from '../services/smsService';
// import { colors } from '../theme/colors';
// import { spacing } from '../theme/spacing';

// const SendMessageModal = ({ visible, onClose, customer, onMessageSent }) => {
//   const [selectedTemplate, setSelectedTemplate] = useState('custom');
//   const [messageContent, setMessageContent] = useState('');
//   const [selectedCustomers, setSelectedCustomers] = useState(customer ? [customer] : []);
//   const [isSending, setIsSending] = useState(false);
//   const [smsAvailable, setSmsAvailable] = useState(false);
//   const [activeCategory, setActiveCategory] = useState('general');

//   useEffect(() => {
//     checkSmsAbility();
//   }, []);

//   const checkSmsAbility = async () => {
//     const available = await checkSmsAvailability();
//     setSmsAvailable(available);
//     if (!available) {
//       Alert.alert('SMS Not Available', 'SMS messaging is not available on this device');
//     }
//   };

//   const handleTemplateSelect = (templateId) => {
//     setSelectedTemplate(templateId);
//     const template = MESSAGE_TEMPLATES[Object.keys(MESSAGE_TEMPLATES).find(
//       key => MESSAGE_TEMPLATES[key].id === templateId
//     )];
//     if (template) {
//       setMessageContent(template.content);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!messageContent.trim()) {
//       Alert.alert('Empty Message', 'Please enter a message before sending');
//       return;
//     }

//     if (selectedCustomers.length === 0) {
//       Alert.alert('No Customers', 'Please select at least one customer');
//       return;
//     }

//     setIsSending(true);
//     try {
//       if (selectedCustomers.length === 1) {
//         const customer = selectedCustomers[0];
//         await sendSmsToCustomer(
//           customer.phoneNumber || customer.mobileNumber,
//           messageContent,
//           customer.customerId || customer.id,
//           selectedTemplate !== 'custom' ? selectedTemplate : null
//         );
        
//         Alert.alert(
//           'Success',
//           `Message sent to ${customer.customerName}`,
//           [{ text: 'OK', onPress: handleReset }]
//         );
//       } else {
//         const results = await sendSmsToMultipleCustomers(
//           selectedCustomers.map(c => ({
//             customerId: c.customerId || c.id,
//             phoneNumber: c.phoneNumber || c.mobileNumber,
//           })),
//           messageContent,
//           selectedTemplate !== 'custom' ? selectedTemplate : null
//         );

//         const successCount = results.filter(r => r.success).length;
//         Alert.alert(
//           'Sending Complete',
//           `${successCount} out of ${results.length} messages sent successfully`,
//           [{ text: 'OK', onPress: handleReset }]
//         );
//       }

//       if (onMessageSent) {
//         onMessageSent();
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to send message');
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleReset = () => {
//     setMessageContent('');
//     setSelectedTemplate('custom');
//     setSelectedCustomers(customer ? [customer] : []);
//     onClose();
//   };

//   const charCount = messageContent.length;
//   const smsCount = Math.ceil(charCount / 160) || 1;

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       presentationStyle="formSheet"
//       onRequestClose={handleReset}
//     >
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={handleReset}>
//             <Text style={styles.cancelButton}>Cancel</Text>
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Send Message</Text>
//           <TouchableOpacity 
//             onPress={handleSendMessage}
//             disabled={isSending || !smsAvailable}
//           >
//             <Text style={[
//               styles.sendButton,
//               (isSending || !smsAvailable) && styles.sendButtonDisabled
//             ]}>
//               {isSending ? 'Sending...' : 'Send'}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
//           {/* Customer Info */}
//           {selectedCustomers.length > 0 && (
//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>Recipients ({selectedCustomers.length})</Text>
//               <View style={styles.recipientList}>
//                 {selectedCustomers.map((c, index) => (
//                   <View key={index} style={styles.recipientItem}>
//                     <Text style={styles.recipientName}>{c.customerName || 'Unknown'}</Text>
//                     <Text style={styles.recipientPhone}>{c.phoneNumber || c.mobileNumber}</Text>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           )}

//           {/* Template Selection */}
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Message Template</Text>
//             <ScrollView 
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               style={styles.templateScroll}
//             >
//               {Object.values(MESSAGE_TEMPLATES).map((template) => (
//                 <TouchableOpacity
//                   key={template.id}
//                   style={[
//                     styles.templateButton,
//                     selectedTemplate === template.id && styles.templateButtonActive,
//                   ]}
//                   onPress={() => handleTemplateSelect(template.id)}
//                 >
//                   <Text style={[
//                     styles.templateText,
//                     selectedTemplate === template.id && styles.templateTextActive,
//                   ]}>
//                     {template.name}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>

//           {/* Message Content */}
//           <View style={styles.section}>
//             <View style={styles.messageHeader}>
//               <Text style={styles.sectionTitle}>Message</Text>
//               <Text style={styles.charCount}>{charCount}/160 ({smsCount} SMS)</Text>
//             </View>
//             <TextInput
//               style={styles.messageInput}
//               placeholder="Type your message here..."
//               multiline
//               placeholderTextColor={colors.textSecondary}
//               value={messageContent}
//               onChangeText={setMessageContent}
//               maxLength={480} // Allow up to 3 SMS
//               editable={!isSending}
//             />
//           </View>

//           {/* Info */}
//           <View style={styles.infoBox}>
//             <Text style={styles.infoText}>
//               💡 SMS will be sent using your device's default SMS application. Messages over 160 characters will be split into multiple SMS.
//             </Text>
//           </View>
//         </ScrollView>

//         {isSending && (
//           <View style={styles.loadingOverlay}>
//             <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//         )}
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: spacing.lg,
//     paddingVertical: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//     marginTop: spacing.sm,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: colors.text,
//   },
//   cancelButton: {
//     color: colors.textSecondary,
//     fontSize: 16,
//   },
//   sendButton: {
//     color: colors.primary,
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   sendButtonDisabled: {
//     opacity: 0.5,
//   },
//   content: {
//     flex: 1,
//     padding: spacing.lg,
//   },
//   section: {
//     marginBottom: spacing.xl,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: colors.text,
//     marginBottom: spacing.md,
//   },
//   recipientList: {
//     backgroundColor: colors.surface,
//     borderRadius: 8,
//     padding: spacing.md,
//     borderWidth: 1,
//     borderColor: colors.border,
//   },
//   recipientItem: {
//     marginBottom: spacing.md,
//     paddingBottom: spacing.md,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border,
//   },
//   recipientItem: {
//     paddingVertical: spacing.sm,
//   },
//   recipientName: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: colors.text,
//   },
//   recipientPhone: {
//     fontSize: 12,
//     color: colors.textSecondary,
//     marginTop: spacing.xs,
//   },
//   templateScroll: {
//     marginBottom: spacing.md,
//   },
//   templateButton: {
//     paddingHorizontal: spacing.md,
//     paddingVertical: spacing.sm,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginRight: spacing.md,
//     backgroundColor: colors.surface,
//   },
//   templateButtonActive: {
//     backgroundColor: colors.primary,
//     borderColor: colors.primary,
//   },
//   templateText: {
//     fontSize: 12,
//     color: colors.text,
//   },
//   templateTextActive: {
//     color: 'white',
//     fontWeight: '600',
//   },
//   messageHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: spacing.md,
//   },
//   charCount: {
//     fontSize: 12,
//     color: colors.textSecondary,
//   },
//   messageInput: {
//     backgroundColor: colors.surface,
//     borderWidth: 1,
//     borderColor: colors.border,
//     borderRadius: 8,
//     padding: spacing.md,
//     minHeight: 120,
//     fontSize: 14,
//     color: colors.text,
//     textAlignVertical: 'top',
//   },
//   infoBox: {
//     backgroundColor: colors.infoBackground || '#EEF4FF',
//     borderLeftWidth: 4,
//     borderLeftColor: colors.primary,
//     padding: spacing.md,
//     borderRadius: 6,
//     marginTop: spacing.lg,
//   },
//   infoText: {
//     fontSize: 12,
//     color: colors.text,
//     lineHeight: 18,
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default SendMessageModal;


import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { MESSAGE_TEMPLATES } from '../constants/messageTemplates';
import { checkSmsAvailability, getAvailableSims, sendSmsToCustomer, sendSmsToMultipleCustomers } from '../services/nativeSmsService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const SendMessageModal = ({ visible, onClose, customer, onMessageSent }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  const [messageContent, setMessageContent] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState(customer ? [customer] : []);
  const [isSending, setIsSending] = useState(false);
  const [smsAvailable, setSmsAvailable] = useState(false);
  const [availableSims, setAvailableSims] = useState([]);
  const [selectedSimSlot, setSelectedSimSlot] = useState(0);

  useEffect(() => {
    if (visible) {
      initializeSmsAndSims();
    }
  }, [visible]);

  const initializeSmsAndSims = async () => {
    console.log('Initializing SMS and SIM detection...');
    try {
      // Check SMS availability (this will also request permissions if needed)
      const available = await checkSmsAvailability();
      setSmsAvailable(available);
      console.log('SMS availability:', available);

      // Load available SIMs
      await loadAvailableSims();

      // Only show alert if explicitly not available (not just during first check)
      if (!available) {
        console.warn('SMS is not available - user may need to grant permissions or device lacks SMS capability');
      }
    } catch (error) {
      console.error('Error during SMS initialization:', error);
      // Don't fail silently - set defaults
      setAvailableSims([{ id: 0, name: 'Default SIM' }]);
      setSelectedSimSlot(0);
    }
  };

  const loadAvailableSims = async () => {
    try {
      console.log('Loading available SIMs...');
      const sims = await getAvailableSims();
      console.log('Loaded SIMs:', sims);

      if (sims && Array.isArray(sims) && sims.length > 0) {
        // Log detailed SIM info for debugging
        sims.forEach((sim, idx) => {
          console.log(`📱 ========== SIM ${idx} ==========`);
          console.log(`  id: ${sim.id}`);
          console.log(`  name: ${sim.name}`);
          console.log(`  carrierName: ${sim.carrierName}`);
          console.log(`  phoneNumber: ${sim.phoneNumber}`);
          console.log(`  isActive: ${sim.isActive}`);
          console.log(`  isReady: ${sim.isReady}`);
        });

        setAvailableSims(sims);
        const firstSimId = sims[0].id !== undefined ? sims[0].id : 0;
        setSelectedSimSlot(firstSimId);
        console.log('✓ SIM cards loaded successfully, selected:', firstSimId);
      } else {
        console.warn('No SIMs detected, using default');
        // Default to single SIM
        setAvailableSims([{ id: 0, name: 'Default SIM' }]);
        setSelectedSimSlot(0);
      }
    } catch (error) {
      console.error('Error loading SIMs:', error);
      // Fallback to default SIM
      setAvailableSims([{ id: 0, name: 'Default SIM' }]);
      setSelectedSimSlot(0);
    }
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    const template = MESSAGE_TEMPLATES[Object.keys(MESSAGE_TEMPLATES).find(
      key => MESSAGE_TEMPLATES[key].id === templateId
    )];
    if (template) {
      setMessageContent(template.content);
    }
  };

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      Alert.alert('Empty Message', 'Please enter a message before sending');
      return;
    }

    if (selectedCustomers.length === 0) {
      Alert.alert('No Customers', 'Please select at least one customer');
      return;
    }

    setIsSending(true);
    try {
      if (selectedCustomers.length === 1) {
        const selectedCustomer = selectedCustomers[0];
        await sendSmsToCustomer(
          selectedCustomer.phoneNumber || selectedCustomer.mobileNumber,
          messageContent,
          selectedCustomer.customerId || selectedCustomer.id,
          selectedTemplate !== 'custom' ? selectedTemplate : null,
          parseInt(selectedSimSlot, 10)
        );
        
        Alert.alert(
          'Success',
          `Message sent to ${selectedCustomer.customerName}`,
          [{ text: 'OK', onPress: handleReset }]
        );
      } else {
        const results = await sendSmsToMultipleCustomers(
          selectedCustomers.map(c => ({
            customerId: c.customerId || c.id,
            phoneNumber: c.phoneNumber || c.mobileNumber,
          })),
          messageContent,
          selectedTemplate !== 'custom' ? selectedTemplate : null,
          parseInt(selectedSimSlot, 10)
        );

        const successCount = results.filter(r => r.success).length;
        Alert.alert(
          'Sending Complete',
          `${successCount} out of ${results.length} messages sent successfully`,
          [{ text: 'OK', onPress: handleReset }]
        );
      }

      if (onMessageSent) {
        onMessageSent();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setMessageContent('');
    setSelectedTemplate('custom');
    setSelectedCustomers(customer ? [customer] : []);
    onClose();
  };

  const charCount = messageContent.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleReset}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Message</Text>
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={isSending || !smsAvailable}
          >
            <Text style={[
              styles.sendButton,
              (isSending || !smsAvailable) && styles.sendButtonDisabled
            ]}>
              {isSending ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Customer Info */}
          {selectedCustomers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recipients ({selectedCustomers.length})</Text>
              <View style={styles.recipientList}>
                {selectedCustomers.map((c, index) => (
                  <View key={index} style={styles.recipientItem}>
                    <Text style={styles.recipientName}>{c.customerName || 'Unknown'}</Text>
                    <Text style={styles.recipientPhone}>{c.phoneNumber || c.mobileNumber}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* SIM Selection */}
          {availableSims.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select SIM Card</Text>
              <View style={styles.simSelector}>
                {availableSims.map((sim) => {
                  const displayCarrier = sim.carrierName || sim.name || `SIM ${sim.id + 1}`;
                  const displayPhone = sim.phoneNumber || 'No number assigned';

                  return (
                    <TouchableOpacity
                      key={sim.id}
                      style={[
                        styles.simOption,
                        selectedSimSlot === sim.id && styles.simOptionSelected,
                      ]}
                      onPress={() => setSelectedSimSlot(sim.id)}
                    >
                      <View style={styles.simOptionContent}>
                        <Text style={[
                          styles.simOptionText,
                          selectedSimSlot === sim.id && styles.simOptionTextSelected,
                        ]}>
                          {displayCarrier}
                        </Text>
                        <Text style={[
                          styles.simPhoneText,
                          selectedSimSlot === sim.id && styles.simPhoneTextSelected,
                        ]}>
                          {displayPhone}
                        </Text>
                      </View>
                      {selectedSimSlot === sim.id && (
                        <Text style={styles.simCheckmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Template Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message Template</Text>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.templateScroll}
            >
              {Object.values(MESSAGE_TEMPLATES).map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateButton,
                    selectedTemplate === template.id && styles.templateButtonActive,
                  ]}
                  onPress={() => handleTemplateSelect(template.id)}
                >
                  <Text style={[
                    styles.templateText,
                    selectedTemplate === template.id && styles.templateTextActive,
                  ]}>
                    {template.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Message Content */}
          <View style={styles.section}>
            <View style={styles.messageHeader}>
              <Text style={styles.sectionTitle}>Message</Text>
              <Text style={styles.charCount}>{charCount}/160 ({smsCount} SMS)</Text>
            </View>
            <TextInput
              style={styles.messageInput}
              placeholder="Type your message here..."
              multiline
              placeholderTextColor={colors.textSecondary}
              value={messageContent}
              onChangeText={setMessageContent}
              maxLength={480} // Allow up to 3 SMS
              editable={!isSending}
            />
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 SMS will be sent directly from your device SIM. Messages over 160 characters will be split into multiple SMS. Select a SIM card above to choose which one to use.
            </Text>
          </View>
        </ScrollView>

        {isSending && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cancelButton: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  sendButton: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  recipientList: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recipientItem: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  recipientPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  templateScroll: {
    marginBottom: spacing.md,
  },
  templateButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
  },
  templateButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  templateText: {
    fontSize: 12,
    color: colors.text,
  },
  templateTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 120,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: colors.infoBackground || '#EEF4FF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    borderRadius: 6,
    marginTop: spacing.lg,
  },
  infoText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simSelector: {
    flexDirection: 'column',
    gap: spacing.md,
  },
  simOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  simOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  simOptionContent: {
    flex: 1,
  },
  simOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  simOptionTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  simPhoneText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  simPhoneTextSelected: {
    color: colors.primary,
  },
  simCheckmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default SendMessageModal;