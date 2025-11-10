import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  checkSmsAvailability,
  getAvailableSims,
  sendSmsToCustomer,
} from '../services/nativeSmsService';
import { enhancedTheme } from '../theme/enhancedTheme';
import ModernButtonEnhanced from './ui/ModernButtonEnhanced';
import ModernInputEnhanced from './ui/ModernInputEnhanced';
import ModernModal from './ui/ModernModal';

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
        try {
          const sims = await getAvailableSims();
          console.log('📱 Available SIMs (raw):', JSON.stringify(sims, null, 2));
          console.log('📱 SIM Count:', sims?.length || 0);
          
          if (sims && Array.isArray(sims) && sims.length > 0) {
            sims.forEach((sim, idx) => {
              console.log(`📱 ========== SIM ${idx} ==========`);
              console.log(`  id: ${sim.id}`);
              console.log(`  name: ${sim.name}`);
              console.log(`  phoneNumber: ${sim.phoneNumber}`);
              console.log(`  carrierName: ${sim.carrierName}`);
              console.log(`  isReady: ${sim.isReady}`);
              console.log(`  isActive: ${sim.isActive}`);
              console.log(`  countryIso: ${sim.countryIso}`);
              console.log(`  mcc/mnc: ${sim.mcc}/${sim.mnc}`);
            });
            setAvailableSims(sims);
            setSelectedSim(sims[0]);
          } else {
            console.warn('⚠️ No SIMs found, setting empty array');
            setAvailableSims([]);
          }
        } catch (simError) {
          console.error('❌ Error getting available SIMs:', simError);
          setAvailableSims([]);
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
    <ModernModal
      visible={visible}
      onClose={handleReset}
      title="Send SMS (Native)"
      headerAction={
        <ModernButtonEnhanced
          title={isSending ? 'Sending...' : 'Send'}
          onPress={handleSendSms}
          disabled={isSending || !smsAvailable || !selectedSim}
          variant="primary"
          size="small"
          loading={isSending}
        />
      }
    >
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={enhancedTheme.colors.primary} />
          <Text style={styles.loadingText}>Initializing SMS service...</Text>
        </View>
      ) : !smsAvailable ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>❌ SMS not available</Text>
          <Text style={styles.errorSubtext}>
            Please grant SMS permissions in settings
          </Text>
          <ModernButtonEnhanced
            title="Retry"
            onPress={initializeSms}
            variant="primary"
            size="md"
          />
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
                  {availableSims.map((sim) => {
                    const displayCarrier = sim.carrierName || sim.name || `SIM ${sim.id + 1}`;
                    const displayPhone = sim.phoneNumber || 'No number assigned';
                    
                    return (
                      <TouchableOpacity
                        key={sim.id}
                        style={[
                          styles.simCard,
                          selectedSim?.id === sim.id && styles.simCardSelected,
                        ]}
                        onPress={() => {
                          console.log('Selected SIM:', { 
                            id: sim.id, 
                            name: displayCarrier, 
                            phone: displayPhone,
                            carrierName: sim.carrierName,
                            fullSim: sim
                          });
                          setSelectedSim(sim);
                        }}
                      >
                        <View style={styles.simCardContent}>
                          <Text
                            style={[
                              styles.simCardTitle,
                              selectedSim?.id === sim.id &&
                                styles.simCardTitleSelected,
                            ]}
                          >
                            {displayCarrier}
                          </Text>
                          <Text
                            style={[
                              styles.simCardPhone,
                              selectedSim?.id === sim.id &&
                                styles.simCardPhoneSelected,
                            ]}
                          >
                            {displayPhone}
                          </Text>
                        </View>
                        {selectedSim?.id === sim.id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
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
              <ModernInputEnhanced
                placeholder="Enter phone number"
                label="Phone Number"
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
              <ModernInputEnhanced
                placeholder="Type your message..."
                label="Message"
                value={message}
                onChangeText={setMessage}
                editable={!isSending}
                multiline
                numberOfLines={4}
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
    </ModernModal>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: enhancedTheme.spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: enhancedTheme.spacing.lg,
  },
  loadingText: {
    marginTop: enhancedTheme.spacing.lg,
    fontSize: 14,
    color: enhancedTheme.colors.neutral900,
  },
  errorText: {
    fontSize: 16,
    color: enhancedTheme.colors.error,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral600,
    marginTop: enhancedTheme.spacing.sm,
    marginBottom: enhancedTheme.spacing.lg,
  },
  section: {
    marginBottom: enhancedTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
    marginBottom: enhancedTheme.spacing.md,
  },
  infoBox: {
    backgroundColor: enhancedTheme.colors.neutral50,
    borderLeftWidth: 5,
    borderLeftColor: enhancedTheme.colors.primary,
    padding: enhancedTheme.spacing.md,
    borderRadius: enhancedTheme.borderRadius.md,
    marginBottom: enhancedTheme.spacing.xl,
    shadowColor: enhancedTheme.colors.neutral900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoText: {
    fontSize: 13,
    color: enhancedTheme.colors.neutral700,
    lineHeight: 20,
    fontWeight: '500',
  },
  simGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: enhancedTheme.spacing.md,
  },
  simCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: enhancedTheme.colors.neutral50,
    borderWidth: 2,
    borderColor: enhancedTheme.colors.neutral200,
    borderRadius: enhancedTheme.borderRadius.lg,
    padding: enhancedTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: enhancedTheme.colors.neutral900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  simCardSelected: {
    borderColor: enhancedTheme.colors.primary,
    backgroundColor: enhancedTheme.colors.primary + '15',
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
    color: enhancedTheme.colors.neutral900,
  },
  simCardTitleSelected: {
    color: enhancedTheme.colors.primary,
  },
  simCardPhone: {
    fontSize: 11,
    color: enhancedTheme.colors.neutral600,
    marginTop: enhancedTheme.spacing.xs,
  },
  simCardPhoneSelected: {
    color: enhancedTheme.colors.primary,
  },
  simCardCarrier: {
    fontSize: 10,
    color: enhancedTheme.colors.neutral600,
    marginTop: enhancedTheme.spacing.xs,
  },
  simCardCarrierSelected: {
    color: enhancedTheme.colors.primary,
  },
  checkmark: {
    fontSize: 18,
    color: enhancedTheme.colors.primary,
    fontWeight: 'bold',
  },
  simDetailsBox: {
    backgroundColor: enhancedTheme.colors.neutral0,
    borderWidth: 1.5,
    borderColor: enhancedTheme.colors.primary + '30',
    borderRadius: enhancedTheme.borderRadius.md,
    padding: enhancedTheme.spacing.md,
    marginBottom: enhancedTheme.spacing.xl,
    shadowColor: enhancedTheme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  simDetailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: enhancedTheme.colors.primary,
    marginBottom: enhancedTheme.spacing.md,
    paddingBottom: enhancedTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: enhancedTheme.colors.primary + '20',
  },
  simDetail: {
    fontSize: 13,
    color: enhancedTheme.colors.neutral900,
    marginBottom: enhancedTheme.spacing.md,
    lineHeight: 18,
  },
  detailLabel: {
    fontWeight: '700',
    color: enhancedTheme.colors.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.md,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '600',
    color: enhancedTheme.colors.primary,
    backgroundColor: enhancedTheme.colors.neutral50,
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.xs,
    borderRadius: enhancedTheme.borderRadius.sm,
  },
  resultBox: {
    borderRadius: enhancedTheme.borderRadius.lg,
    padding: enhancedTheme.spacing.lg,
    marginTop: enhancedTheme.spacing.lg,
    marginBottom: enhancedTheme.spacing.xl,
    shadowColor: enhancedTheme.colors.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultBoxSuccess: {
    backgroundColor: enhancedTheme.colors.success + '20',
    borderLeftWidth: 5,
    borderLeftColor: enhancedTheme.colors.success,
  },
  resultBoxError: {
    backgroundColor: enhancedTheme.colors.error + '20',
    borderLeftWidth: 5,
    borderLeftColor: enhancedTheme.colors.error,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: enhancedTheme.spacing.sm,
    color: enhancedTheme.colors.neutral900,
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: enhancedTheme.spacing.sm,
  },
  resultMessageSuccess: {
    color: enhancedTheme.colors.success,
  },
  resultMessageError: {
    color: enhancedTheme.colors.error,
  },
  resultDetails: {
    fontSize: 13,
    color: enhancedTheme.colors.neutral600,
    marginBottom: enhancedTheme.spacing.xs,
  },
  resultTimestamp: {
    fontSize: 11,
    color: enhancedTheme.colors.neutral600,
    marginTop: enhancedTheme.spacing.sm,
    fontStyle: 'italic',
  },
  footer: {
    height: enhancedTheme.spacing.lg,
  },
});

export default SmsExample;
