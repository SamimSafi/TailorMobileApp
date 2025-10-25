import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InvoiceList from '../components/InvoiceList';
import PaymentModal from '../components/PaymentModal';
import QadAndamList from '../components/QadAndamList';
import { useCustomerStore } from '../store/customerStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

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

      Alert.alert('Success', 'Payment recorded successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to record payment');
      throw error;
    }
  };

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Details</Text>
        <TouchableOpacity
          disabled={loading || !customerId}
          onPress={() => {
            if (!customerId) {
              return;
            }

            refreshCustomerData(customerId)
              .catch((err) => {
                console.error('Failed to refresh customer data:', err);
              });
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="refresh" size={24} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.customerName}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color={colors.primary} />
              <Text style={styles.infoText}>
                {formatPhoneNumber(customer.phoneNumber)}
              </Text>
            </View>
            {customer.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color={colors.primary} />
                <Text style={styles.infoText}>{customer.address}</Text>
              </View>
            )}
            {customer.serialNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="barcode" size={16} color={colors.primary} />
                <Text style={styles.infoText}>{customer.serialNumber}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Balance & Due Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="wallet-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statLabel}>Balance</Text>
            <Text
              style={[
                styles.statValue,
                {
                  color: balance >= 0 ? colors.success : colors.error,
                },
              ]}
            >
              {formatCurrency(balance)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons
                name={totalDue > 0 ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                size={20}
                color={totalDue > 0 ? colors.error : colors.success}
              />
            </View>
            <Text style={styles.statLabel}>Total Due</Text>
            <Text
              style={[
                styles.statValue,
                { color: totalDue > 0 ? colors.error : colors.success },
              ]}
            >
              {formatCurrency(totalDue)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="document-text-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statLabel}>Invoices</Text>
            <Text style={styles.statValue}>{invoices.length}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'items' && styles.tabActive]}
            onPress={() => setActiveTab('items')}
          >
            <Ionicons
              name="shirt-outline"
              size={18}
              color={activeTab === 'items' ? colors.primary : colors.darkGray}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'items' && styles.tabTextActive,
              ]}
            >
              QAD Andams
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === 'items' && styles.tabBadgeActive,
              ]}
            >
              <Text style={styles.tabBadgeText}>
                {qadAndams.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'invoices' && styles.tabActive]}
            onPress={() => setActiveTab('invoices')}
          >
            <Ionicons
              name="receipt-outline"
              size={18}
              color={activeTab === 'invoices' ? colors.primary : colors.darkGray}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'invoices' && styles.tabTextActive,
              ]}
            >
              Invoices
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab === 'invoices' && styles.tabBadgeActive,
              ]}
            >
              <Text style={styles.tabBadgeText}>
                {invoices.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : activeTab === 'items' ? (
            <>
              <QadAndamList
                qadAndams={qadAndams}
                loading={false}
                onSelectQadAndam={handleSelectQadAndam}
              />
              {qadAndams.length > 0 && (
                <TouchableOpacity
                  style={styles.createInvoiceButton}
                  onPress={() => {
                    navigation.navigate('CreateInvoice', {
                      customer,
                      qadAndam: null,
                    });
                  }}
                >
                  <Ionicons name="add-circle" size={20} color={colors.white} />
                  <Text style={styles.createInvoiceButtonText}>
                    Create Invoice
                  </Text>
                </TouchableOpacity>
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
    </SafeAreaView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: colors.darkGray,
    flex: 1,
  },
  statsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.darkGray,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabBadge: {
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: colors.primary,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  tabContent: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  createInvoiceButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  createInvoiceButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomerDetailsScreen;

