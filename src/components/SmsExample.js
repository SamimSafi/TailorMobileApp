import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
  const resultScaleAnim = useRef(new Animated.Value(0)).current;
  const resultOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      initializeSms();
    }
  }, [visible]);

  useEffect(() => {
    if (result) {
      resultScaleAnim.setValue(0);
      resultOpacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(resultScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(resultOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [result]);

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
        title: '✅ SMS Sent Successfully',
        message: `Message delivered to ${phoneNumber}`,
        details: `Using: ${selectedSim.name}`,
        timestamp: new Date().toLocaleTimeString(),
      });

      setTimeout(() => {
        setPhoneNumber('');
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error sending SMS:', error);
      setResult({
        success: false,
        title: '❌ Failed to Send SMS',
        message: error.message || 'An error occurred',
        details: 'Please try again',
      });
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
              <Animated.View
                style={[
                  styles.resultBox,
                  result.success
                    ? styles.resultBoxSuccess
                    : styles.resultBoxError,
                  {
                    transform: [{ scale: resultScaleAnim }],
                    opacity: resultOpacityAnim,
                  },
                ]}
              >
                <Text style={styles.resultTitle}>{result.title}</Text>
                <Text
                  style={[
                    styles.resultMessage,
                    result.success
                      ? styles.resultMessageSuccess
                      : styles.resultMessageError,
                  ]}
                >
                  {result.message}
                </Text>
                {result.details && (
                  <Text style={styles.resultDetails}>{result.details}</Text>
                )}
                {result.timestamp && (
                  <Text style={styles.resultTimestamp}>{result.timestamp}</Text>
                )}
              </Animated.View>
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
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  cancelButton: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  sendButton: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  sendButtonDisabled: {
    opacity: 0.6,
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
    backgroundColor: colors.infoBackground || '#E3F2FD',
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '500',
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
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  simCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
    borderWidth: 2,
    shadowOpacity: 0.15,
    elevation: 4,
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
    borderWidth: 1.5,
    borderColor: colors.primary + '30',
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  simDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '20',
  },
  simDetail: {
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  detailLabel: {
    fontWeight: '700',
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.infoBackground || '#E3F2FD',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    minHeight: 100,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  resultBox: {
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultBoxSuccess: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  resultBoxError: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 5,
    borderLeftColor: '#F44336',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  resultMessageSuccess: {
    color: '#2E7D32',
  },
  resultMessageError: {
    color: '#C62828',
  },
  resultDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultTimestamp: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
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
