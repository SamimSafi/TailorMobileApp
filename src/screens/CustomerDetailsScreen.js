import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, FileText, Mail, Plus, RefreshCw, Shirt } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddQadAndamModal from '../components/AddQadAndamModal';
import InvoiceList from '../components/InvoiceList';
import PaymentModal from '../components/PaymentModal';
import QadAndamList from '../components/QadAndamList';
import QadAndamReceiptModal from '../components/QadAndamReceiptModal';
import SmsExample from '../components/SmsExample';
import ModernBadge from '../components/ui/ModernBadge';
import ModernButtonEnhanced from '../components/ui/ModernButtonEnhanced';
import ModernEmptyState from '../components/ui/ModernEmptyState';
import ModernLoading from '../components/ui/ModernLoading';
import businessInfoDefaults from '../constants/businessInfo';
import { useLanguage } from '../hooks/useLanguage';
import { ensureBusinessInfoInitialized, getStoredBusinessInfo } from '../services/businessInfoService';
import { useCustomerStore } from '../store/customerStore';
import { enhancedTheme } from '../theme/enhancedTheme';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';
import { toastError, toastSuccess } from '../utils/toastManager';

const CustomerDetailsScreen = ({ navigation, route }) => {
  // Localization
  const { t } = useLanguage();
  
  const customer = useCustomerStore((state) => state.selectedCustomer);
  const qadAndams = useCustomerStore((state) => state.qadAndams);
  const invoices = useCustomerStore((state) => state.invoices);
  const balance = useCustomerStore((state) => state.balance);
  const loading = useCustomerStore((state) => state.loading);
  const paymentLoading = useCustomerStore((state) => state.paymentLoading);
  const refreshCustomerData = useCustomerStore((state) => state.refreshCustomerData);
  const clearCustomer = useCustomerStore((state) => state.clearCustomer);
  const recordPayment = useCustomerStore((state) => state.recordPayment);

  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'invoices'
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [smsModalVisible, setSmsModalVisible] = useState(false);
  const [addQadAndamModalVisible, setAddQadAndamModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedReceiptQadAndam, setSelectedReceiptQadAndam] = useState(null);
  const [businessInfo, setBusinessInfo] = useState({
    ...businessInfoDefaults,
    logos: {
      primary: '',
    },
  });
  useEffect(() => {
    let mounted = true;
    ensureBusinessInfoInitialized()
      .then((info) => info || getStoredBusinessInfo())
      .then((info) => {
        if (mounted && info) {
          setBusinessInfo(info);
        }
      })
      .catch((error) => {
        console.warn('[CustomerDetailsScreen] Failed to load business info', error);
      });

    return () => {
      mounted = false;
    };
  }, []);
  const customerId = customer?.customerId;

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!customerId) {
        return;
      }

      console.log('Screen focused, reloading customer data for:', customerId);
      
      refreshCustomerData(customerId)
        .catch((err) => {
          console.error('Failed to refresh customer data:', err);
        });

      // No cleanup on unfocus - let data persist
    }, [customerId, refreshCustomerData])
  );

  // Handle Android back button - using React Navigation's built-in support
  // Note: useFocusEffect already handles data refresh, and React Navigation
  // handles back button navigation automatically on Android

  // Clear customer data only on unmount
  useEffect(() => {
    return () => {
      console.log('Details screen unmounting, clearing customer data');
      clearCustomer();
    };
  }, [clearCustomer]);

  const handleSelectQadAndam = (qadAndam) => {
    navigation.navigate('CreateInvoice', {
      customer,
      qadAndam,
    });
  };

  const handleSelectInvoice = (invoice) => {
    if (paymentModalVisible || !invoice) {
      return;
    }

    setSelectedInvoice(invoice);
    setPaymentModalVisible(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const customerIdentifier = customer?.customerId || customer?.id || customer?._id;
      if (!customerIdentifier) {
        throw new Error('Customer ID not found');
      }

      await recordPayment({
        invoiceId: paymentData.invoiceId,
        customerId: customerIdentifier,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes || '',
      });

      toastSuccess('Payment recorded successfully');
    } catch (error) {
      toastError(error.message || 'Failed to record payment');
      throw error;
    }
  };

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <ModernLoading visible={true} message={t('common.loading')} />
      </SafeAreaView>
    );
  }

  const initials = customer.customerName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'C';

  const totalDue = invoices.reduce((sum, inv) => {
    const dueAmount = inv.dueAmount || (inv.totalAmount - (inv.paidAmount || 0));
    return sum + (dueAmount > 0 ? dueAmount : 0);
  }, 0);

  const primaryContact = customer.phoneNumber || customer.phone || customer.whatsapp;

  const customerAtAGlance = useMemo(
    () => [
      {
        label: t('common.search'),
        value: customer.serialNumber || customer.serial || '—',
      },
      {
        label: t('customer.phone'),
        value: formatPhoneNumber(primaryContact) || '—',
      },
      {
        label: t('customer.address'),
        value: customer.address || '—',
      },
      {
        label: t('invoice.items'),
        value: invoices.length.toString(),
      },
      {
        label: t('qadAndam.measurements'),
        value: qadAndams.length.toString(),
      },
    ],
    [customer, primaryContact, invoices.length, qadAndams.length, t]
  );

  const handleViewReceipt = (qadAndam) => {
    setSelectedReceiptQadAndam(qadAndam);
    setReceiptModalVisible(true);
  };

  const selectedReceiptInvoice = useMemo(() => {
    if (!selectedReceiptQadAndam) {
      return null;
    }
    const identifiers = [
      selectedReceiptQadAndam.id,
      selectedReceiptQadAndam._id,
      selectedReceiptQadAndam.qadAndamId,
    ].filter(Boolean);

    return (
      invoices.find((inv) => identifiers.includes(inv.qadAndamId)) ||
      invoices.find((inv) => identifiers.includes(inv.qadAndam?.id)) ||
      invoices.find((inv) => identifiers.includes(inv.id) || identifiers.includes(inv._id)) ||
      null
    );
  }, [selectedReceiptQadAndam, invoices]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: enhancedTheme.colors.primary, ...enhancedTheme.shadows.lg }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: '#ffffff' }]}>{t('customer.details')}</Text>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>{t('customer.viewInvoices')}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setSmsModalVisible(true)}
            >
              <Mail size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loading || !customerId}
              onPress={() => {
                if (!customerId) {
                  return;
                }
                refreshCustomerData(customerId).catch((err) => {
                  console.error('Failed to refresh customer data:', err);
                });
              }}
            >
              <RefreshCw 
                size={24} 
                color="#ffffff"
                style={loading ? styles.spinning : {}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{customer.customerName}</Text>
          <Text style={styles.summarySubtitle}>
            {formatPhoneNumber(customer.phoneNumber) || 'No phone'}
          </Text>

          <View style={styles.summaryGrid}>
            {customerAtAGlance.map(({ label, value }) => (
              <View key={label} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryValue} numberOfLines={2}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats Chips */}
        <View style={styles.statsRow}>
          <View style={[styles.statChip, { borderColor: enhancedTheme.colors.success }]}>
            <Text style={styles.statChipLabel}>{t('customer.balance')}</Text>
            <Text
              style={[
                styles.statChipValue,
                { color: balance >= 0 ? enhancedTheme.colors.success : enhancedTheme.colors.error },
              ]}
            >
              {formatCurrency(balance)}
            </Text>
          </View>

          <View style={[styles.statChip, { borderColor: totalDue > 0 ? enhancedTheme.colors.error : enhancedTheme.colors.success }]}>
            <Text style={styles.statChipLabel}>{t('payment.amountToPay')}</Text>
            <Text
              style={[
                styles.statChipValue,
                { color: totalDue > 0 ? enhancedTheme.colors.error : enhancedTheme.colors.success },
              ]}
            >
              {formatCurrency(totalDue)}
            </Text>
          </View>

          <View style={[styles.statChip, { borderColor: enhancedTheme.colors.primary }]}>
            <Text style={styles.statChipLabel}>{t('invoice.items')}</Text>
            <Text style={[styles.statChipValue, { color: enhancedTheme.colors.primary }]}>
              {invoices.length}
            </Text>
          </View>
        </View>

        {/* Tabs - Modern Style */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.tabActive]}
            onPress={() => setActiveTab('items')}
          >
            <Shirt
              size={18}
              color={activeTab === 'items' ? enhancedTheme.colors.primary : enhancedTheme.colors.neutral500}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'items' && styles.tabTextActive,
              ]}
            >
              {t('qadAndam.measurements')}
            </Text>
            <ModernBadge 
              text={qadAndams.length.toString()}
              variant={activeTab === 'items' ? 'primary' : 'secondary'}
              size="sm"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'invoices' && styles.tabActive]}
            onPress={() => setActiveTab('invoices')}
          >
            <FileText
              size={18}
              color={activeTab === 'invoices' ? enhancedTheme.colors.primary : enhancedTheme.colors.neutral500}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'invoices' && styles.tabTextActive,
              ]}
            >
              {t('invoice.items')}
            </Text>
            <ModernBadge 
              text={invoices.length.toString()}
              variant={activeTab === 'invoices' ? 'primary' : 'secondary'}
              size="sm"
            />
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {loading ? (
            <ModernLoading visible={true} message={t('common.loading')} />
          ) : activeTab === 'items' ? (
            <>
              {qadAndams.length === 0 ? (
                <ModernEmptyState
                  icon={<Shirt color={enhancedTheme.colors.neutral400} size={48} />}
                  title={t('qadAndam.noMeasurements')}
                  description={t('emptyState.createFirst')}
                  actionText={t('qadAndam.addMeasurement')}
                  onActionPress={() => setAddQadAndamModalVisible(true)}
                />
              ) : (
                <>
                  <QadAndamList
                    qadAndams={qadAndams}
                    loading={false}
                    onSelectQadAndam={handleSelectQadAndam}
                    onViewReceipt={handleViewReceipt}
                  />
                  <View style={styles.buttonGroup}>
                    <ModernButtonEnhanced
                      title={t('qadAndam.createInvoice')}
                      icon={Plus}
                      variant="primary"
                      size="lg"
                      fullWidth
                      onPress={() => {
                        navigation.navigate('CreateInvoice', {
                          customer,
                          qadAndam: null,
                        });
                      }}
                    />
                    <ModernButtonEnhanced
                      title={t('qadAndam.addMeasurement')}
                      icon={Plus}
                      variant="secondary"
                      size="lg"
                      fullWidth
                      onPress={() => setAddQadAndamModalVisible(true)}
                    />
                  </View>
                </>
              )}
            </>
          ) : (
            <InvoiceList
              invoices={invoices}
              onSelectInvoice={handleSelectInvoice}
            />
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        invoice={selectedInvoice}
        loading={paymentLoading}
        onSubmit={handlePaymentSubmit}
        onClose={() => {
          setPaymentModalVisible(false);
          setSelectedInvoice(null);
        }}
      />

      {/* SMS Modal */}
      <SmsExample
        visible={smsModalVisible}
        onClose={() => setSmsModalVisible(false)}
      />

      {/* Add Qad Andam Modal */}
      <AddQadAndamModal
        visible={addQadAndamModalVisible}
        onClose={() => setAddQadAndamModalVisible(false)}
        customerId={customerId}
        onSuccess={() => {
          // Refresh customer data to get the new qad andam
          if (customerId) {
            refreshCustomerData(customerId);
          }
        }}
      />

      <QadAndamReceiptModal
        visible={receiptModalVisible}
        onClose={() => {
          setReceiptModalVisible(false);
          setSelectedReceiptQadAndam(null);
        }}
        qadAndam={selectedReceiptQadAndam}
        customer={customer}
        invoice={selectedReceiptInvoice}
        businessInfo={businessInfo}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: enhancedTheme.colors.background,
  },
  header: {
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.lg,
    borderBottomLeftRadius: enhancedTheme.borderRadius.lg,
    borderBottomRightRadius: enhancedTheme.borderRadius.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: enhancedTheme.spacing.md,
  },
  backButton: {
    padding: enhancedTheme.spacing.xs,
  },
  headerTitle: {
    fontSize: enhancedTheme.typography.headlineMedium.fontSize,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: enhancedTheme.typography.bodySmall.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: enhancedTheme.spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: enhancedTheme.spacing.md,
  },
  headerButton: {
    padding: enhancedTheme.spacing.xs,
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: enhancedTheme.spacing.lg,
    marginTop: enhancedTheme.spacing.lg,
    marginBottom: enhancedTheme.spacing.md,
    padding: enhancedTheme.spacing.lg,
    borderRadius: enhancedTheme.borderRadius.lg,
    backgroundColor: '#ffffff',
    ...enhancedTheme.shadows.sm,
    gap: enhancedTheme.spacing.md,
  },
  summaryTitle: {
    fontSize: enhancedTheme.typography.headlineSmall.fontSize,
    fontWeight: '700',
    color: enhancedTheme.colors.neutral900,
  },
  summarySubtitle: {
    fontSize: enhancedTheme.typography.bodyMedium.fontSize,
    color: enhancedTheme.colors.neutral600,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: enhancedTheme.spacing.md,
  },
  summaryItem: {
    width: '47%',
    backgroundColor: enhancedTheme.colors.neutral50,
    borderRadius: enhancedTheme.borderRadius.md,
    paddingVertical: enhancedTheme.spacing.sm,
    paddingHorizontal: enhancedTheme.spacing.md,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
  },
  summaryLabel: {
    fontSize: enhancedTheme.typography.bodySmall.fontSize,
    color: enhancedTheme.colors.neutral600,
    fontWeight: '600',
    marginBottom: enhancedTheme.spacing.xs,
  },
  summaryValue: {
    fontSize: enhancedTheme.typography.bodyMedium.fontSize,
    color: enhancedTheme.colors.neutral900,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: enhancedTheme.spacing.md,
    marginHorizontal: enhancedTheme.spacing.lg,
    marginBottom: enhancedTheme.spacing.lg,
    flexWrap: 'wrap',
  },
  statChip: {
    flexGrow: 1,
    flexBasis: '30%',
    borderWidth: 1,
    borderRadius: enhancedTheme.borderRadius.md,
    paddingVertical: enhancedTheme.spacing.md,
    paddingHorizontal: enhancedTheme.spacing.sm,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: enhancedTheme.spacing.xs,
    ...enhancedTheme.shadows.sm,
  },
  statChipLabel: {
    fontSize: enhancedTheme.typography.bodySmall.fontSize,
    color: enhancedTheme.colors.neutral600,
    fontWeight: '600',
  },
  statChipValue: {
    fontSize: enhancedTheme.typography.titleMedium.fontSize,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: enhancedTheme.spacing.lg,
    marginVertical: enhancedTheme.spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: enhancedTheme.borderRadius.md,
    padding: enhancedTheme.spacing.sm,
    gap: enhancedTheme.spacing.sm,
    ...enhancedTheme.shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: enhancedTheme.spacing.sm,
    paddingVertical: enhancedTheme.spacing.md,
    paddingHorizontal: enhancedTheme.spacing.sm,
    borderRadius: enhancedTheme.borderRadius.sm,
    backgroundColor: enhancedTheme.colors.neutral100,
  },
  tabActive: {
    backgroundColor: enhancedTheme.colors.primary,
  },
  tabText: {
    fontSize: enhancedTheme.typography.bodySmall.fontSize,
    color: enhancedTheme.colors.neutral600,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  tabContent: {
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.lg,
    minHeight: 200,
  },
  buttonGroup: {
    gap: enhancedTheme.spacing.md,
    marginTop: enhancedTheme.spacing.lg,
  },
});

export default CustomerDetailsScreen;