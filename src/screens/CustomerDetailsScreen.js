import { useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, FileText, Mail, Plus, RefreshCw, Shirt } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddQadAndamModal from '../components/AddQadAndamModal';
import InvoiceList from '../components/InvoiceList';
import PaymentModal from '../components/PaymentModal';
import QadAndamList from '../components/QadAndamList';
import SmsExample from '../components/SmsExample';
import ModernBadge from '../components/ui/ModernBadge';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import ModernEmptyState from '../components/ui/ModernEmptyState';
import ModernLoading from '../components/ui/ModernLoading';
import { useCustomerStore } from '../store/customerStore';
import { modernTheme, shadows, spacing, typography } from '../theme/modernTheme';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';
import { toastError, toastSuccess } from '../utils/toastManager';

const CustomerDetailsScreen = ({ navigation, route }) => {
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
        <ModernLoading visible={true} message="Loading customer..." />
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, shadows.medium]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={modernTheme.white} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Customer Details</Text>
            <Text style={styles.headerSubtitle}>View & manage customer info</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setSmsModalVisible(true)}
            >
              <Mail size={24} color={modernTheme.white} />
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
                color={modernTheme.white}
                style={loading ? styles.spinning : {}}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info Card */}
        <View style={styles.customerCardContainer}>
          <ModernCard
            title={customer.customerName}
            subtitle={formatPhoneNumber(customer.phoneNumber)}
            description={customer.address}
            variant="elevated"
          >
            <View style={styles.customerInfoContent}>
              {customer.serialNumber && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Serial Number:</Text>
                  <Text style={styles.infoValue}>{customer.serialNumber}</Text>
                </View>
              )}
            </View>
          </ModernCard>
        </View>

        {/* Stats Cards - Balance, Due, Invoices */}
        <View style={styles.statsContainer}>
          <View style={styles.statCardWrapper}>
            <View style={[styles.statCard, { borderLeftColor: modernTheme.success }]}>
              <Text style={styles.statLabel}>Balance</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: balance >= 0 ? modernTheme.success : modernTheme.error,
                  },
                ]}
              >
                {formatCurrency(balance)}
              </Text>
            </View>
          </View>

          <View style={styles.statCardWrapper}>
            <View style={[styles.statCard, { borderLeftColor: totalDue > 0 ? modernTheme.error : modernTheme.success }]}>
              <Text style={styles.statLabel}>Total Due</Text>
              <Text
                style={[
                  styles.statValue,
                  { color: totalDue > 0 ? modernTheme.error : modernTheme.success },
                ]}
              >
                {formatCurrency(totalDue)}
              </Text>
            </View>
          </View>

          <View style={styles.statCardWrapper}>
            <View style={[styles.statCard, { borderLeftColor: modernTheme.primary }]}>
              <Text style={styles.statLabel}>Invoices</Text>
              <Text style={[styles.statValue, { color: modernTheme.primary }]}>
                {invoices.length}
              </Text>
            </View>
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
              color={activeTab === 'items' ? modernTheme.primary : modernTheme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'items' && styles.tabTextActive,
              ]}
            >
              Measurements
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
              color={activeTab === 'invoices' ? modernTheme.primary : modernTheme.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'invoices' && styles.tabTextActive,
              ]}
            >
              Invoices
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
            <ModernLoading visible={true} message="Loading data..." />
          ) : activeTab === 'items' ? (
            <>
              {qadAndams.length === 0 ? (
                <ModernEmptyState
                  icon={<Shirt color={modernTheme.textTertiary} size={48} />}
                  title="No Measurements"
                  description="Register your first measurement to get started"
                  actionText="Register Measurement"
                  onActionPress={() => setAddQadAndamModalVisible(true)}
                />
              ) : (
                <>
                  <QadAndamList
                    qadAndams={qadAndams}
                    loading={false}
                    onSelectQadAndam={handleSelectQadAndam}
                  />
                  <View style={styles.buttonGroup}>
                    <ModernButton
                      text="Create Invoice"
                      icon={Plus}
                      variant="primary"
                      size="md"
                      fullWidth
                      onPress={() => {
                        navigation.navigate('CreateInvoice', {
                          customer,
                          qadAndam: null,
                        });
                      }}
                    />
                    <ModernButton
                      text="Add Measurement"
                      icon={Plus}
                      variant="secondary"
                      size="md"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.background,
  },
  header: {
    backgroundColor: modernTheme.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.headlineMedium,
    color: modernTheme.white,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerButton: {
    padding: spacing.xs,
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  content: {
    flex: 1,
  },
  customerCardContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  customerInfoContent: {
    marginTop: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.bodySmall,
    color: modernTheme.text,
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statCardWrapper: {
    marginBottom: spacing.md,
  },
  statCard: {
    backgroundColor: modernTheme.white,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: spacing.lg,
    ...shadows.small,
  },
  statLabel: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  statValue: {
    ...typography.headlineMedium,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    backgroundColor: modernTheme.white,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.sm,
    ...shadows.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: modernTheme.background,
  },
  tabActive: {
    backgroundColor: modernTheme.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  tabTextActive: {
    color: modernTheme.white,
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    minHeight: 200,
  },
  buttonGroup: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});

export default CustomerDetailsScreen;

