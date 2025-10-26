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
  View,
} from 'react-native';
import {
  checkSmsAvailability,
  getAvailableSims,
  sendSmsToCustomer,
} from '../services/nativeSmsService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const SmsExample = ({ visible, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [availableSims, setAvailableSims] = useState([]);
  const [selectedSim, setSelectedSim] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [smsAvailable, setSmsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (visible) {
      initializeSms();
    }
  }, [visible]);

  const initializeSms = async () => {
    try {
      setLoading(true);
      console.log('🔍 Initializing SMS service...');

      const available = await checkSmsAvailability();
      console.log('📱 SMS Available:', available);
      setSmsAvailable(available);

      if (available) {
        const sims = await getAvailableSims();
        console.log('📱 Available SIMs:', sims);
        setAvailableSims(sims);
        if (sims && sims.length > 0) {
          setSelectedSim(sims[0]);
        }
      }

      setResult(null);
    } catch (error) {
      console.error('Error initializing SMS:', error);
      Alert.alert('Error', 'Failed to initialize SMS: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async () => {
    if (!selectedSim) {
      Alert.alert('Error', 'Please select a SIM card');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      console.log('📤 Sending SMS...', {
        phoneNumber,
        message,
        simSlot: selectedSim.id,
      });

      const sendResult = await sendSmsToCustomer(
        phoneNumber,
        message,
        'example_customer_' + Date.now(),
        null,
        selectedSim.id
      );

      console.log('✅ SMS sent successfully:', sendResult);
      setResult({
        success: true,
        message: 'SMS sent successfully!',
        details: `Sent to ${phoneNumber} via ${selectedSim.name}`,
      });

      Alert.alert('Success', 'SMS sent successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setPhoneNumber('');
            setMessage('');
            setResult(null);
          },
        },
      ]);
    } catch (error) {
      console.error('Error sending SMS:', error);
      setResult({
        success: false,
        message: 'Failed to send SMS',
        details: error.message,
      });
      Alert.alert('Error', error.message || 'Failed to send SMS');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber('');
    setMessage('');
    setResult(null);
    onClose();
  };

  const charCount = message.length;
  const smsCount = Math.ceil(charCount / 160) || 1;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleReset}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.cancelButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send SMS (Native)</Text>
          <TouchableOpacity
            onPress={handleSendSms}
            disabled={isSending || !smsAvailable || !selectedSim}
          >
            <Text
              style={[
                styles.sendButton,
                (isSending || !smsAvailable || !selectedSim) &&
                  styles.sendButtonDisabled,
              ]}
            >
              {isSending ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Initializing SMS service...</Text>
          </View>
        ) : !smsAvailable ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>❌ SMS not available</Text>
            <Text style={styles.errorSubtext}>
              Please grant SMS permissions in settings
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={initializeSms}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📱 This is a native SMS implementation using Android SmsManager.
                SMS will be sent silently in the background.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Select SIM Card ({availableSims.length})
              </Text>
              {availableSims.length === 0 ? (
                <Text style={styles.errorText}>No SIM cards detected</Text>
              ) : (
                <View style={styles.simGrid}>
                  {availableSims.map((sim) => (
                    <TouchableOpacity
                      key={sim.id}
                      style={[
                        styles.simCard,
                        selectedSim?.id === sim.id && styles.simCardSelected,
                      ]}
                      onPress={() => setSelectedSim(sim)}
                    >
                      <View style={styles.simCardContent}>
                        <Text
                          style={[
                            styles.simCardTitle,
                            selectedSim?.id === sim.id &&
                              styles.simCardTitleSelected,
                          ]}
                        >
                          {sim.name}
                        </Text>
                        {sim.phoneNumber && (
                          <Text
                            style={[
                              styles.simCardPhone,
                              selectedSim?.id === sim.id &&
                                styles.simCardPhoneSelected,
                            ]}
                          >
                            {sim.phoneNumber}
                          </Text>
                        )}
                        {sim.carrierName && (
                          <Text
                            style={[
                              styles.simCardCarrier,
                              selectedSim?.id === sim.id &&
                                styles.simCardCarrierSelected,
                            ]}
                          >
                            {sim.carrierName}
                          </Text>
                        )}
                      </View>
                      {selectedSim?.id === sim.id && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {selectedSim && (
              <View style={styles.simDetailsBox}>
                <Text style={styles.simDetailsTitle}>Selected SIM Details:</Text>
                <Text style={styles.simDetail}>
                  <Text style={styles.detailLabel}>Name:</Text> {selectedSim.name}
                </Text>
                {selectedSim.phoneNumber && (
                  <Text style={styles.simDetail}>
                    <Text style={styles.detailLabel}>Phone:</Text>{' '}
                    {selectedSim.phoneNumber}
                  </Text>
                )}
                {selectedSim.carrierName && (
                  <Text style={styles.simDetail}>
                    <Text style={styles.detailLabel}>Carrier:</Text>{' '}
                    {selectedSim.carrierName}
                  </Text>
                )}
                {selectedSim.countryIso && (
                  <Text style={styles.simDetail}>
                    <Text style={styles.detailLabel}>Country:</Text>{' '}
                    {selectedSim.countryIso}
                  </Text>
                )}
                {selectedSim.mcc && (
                  <Text style={styles.simDetail}>
                    <Text style={styles.detailLabel}>MCC/MNC:</Text>{' '}
                    {selectedSim.mcc}/{selectedSim.mnc}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                editable={!isSending}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.section}>
              <View style={styles.messageHeader}>
                <Text style={styles.sectionTitle}>Message</Text>
                <Text style={styles.charCount}>
                  {charCount}/160 ({smsCount} SMS)
                </Text>
              </View>
              <TextInput
                style={styles.messageInput}
                placeholder="Type your message..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                editable={!isSending}
                multiline
                maxLength={480}
              />
            </View>

            {result && (
              <View
                style={[
                  styles.resultBox,
                  result.success
                    ? styles.resultBoxSuccess
                    : styles.resultBoxError,
                ]}
              >
                <Text
                  style={[
                    styles.resultMessage,
                    result.success
                      ? styles.resultMessageSuccess
                      : styles.resultMessageError,
                  ]}
                >
                  {result.success ? '✅' : '❌'} {result.message}
                </Text>
                {result.details && (
                  <Text style={styles.resultDetails}>{result.details}</Text>
                )}
              </View>
            )}

            <View style={styles.footer} />
          </ScrollView>
        )}

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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.error || '#FF6B6B',
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
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
  infoBox: {
    backgroundColor: colors.infoBackground || '#EEF4FF',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    borderRadius: 6,
    marginBottom: spacing.xl,
  },
  infoText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  simGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  simCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  simCardContent: {
    flex: 1,
  },
  simCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  simCardTitleSelected: {
    color: colors.primary,
  },
  simCardPhone: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  simCardPhoneSelected: {
    color: colors.primary,
  },
  simCardCarrier: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  simCardCarrierSelected: {
    color: colors.primary,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  simDetailsBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  simDetailsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  simDetail: {
    fontSize: 12,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontWeight: '600',
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
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
    minHeight: 100,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  },
  resultBox: {
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  resultBoxSuccess: {
    backgroundColor: '#D4EDDA',
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  resultBoxError: {
    backgroundColor: '#F8D7DA',
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  resultMessageSuccess: {
    color: '#155724',
  },
  resultMessageError: {
    color: '#721C24',
  },
  resultDetails: {
    fontSize: 12,
    color: 'inherit',
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
  footer: {
    height: spacing.lg,
  },
});

export default SmsExample;
