import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InvoiceForm from '../components/InvoiceForm';
import { useCustomerStore } from '../store/customerStore';
import { useInvoiceStore } from '../store/invoiceStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { formatCurrency } from '../utils/formatters';

const CreateInvoiceScreen = ({ navigation, route }) => {
  const { customer, qadAndam } = route.params;
  const invoiceStore = useInvoiceStore();
  const customerStore = useCustomerStore();
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    // Pre-fill with QAD Andam data if available
    if (qadAndam) {
      invoiceStore.setInvoiceData({
        totalAmount: qadAndam.totalAmount?.toString() || '',
        paidAmount: qadAndam.paidAmount?.toString() || '',
        dueDate: qadAndam.returnDate || '',
        returnDate: qadAndam.returnDate || '',
        joraCount: '',
      });
    }
  }, [qadAndam]);

  const handleSubmit = async () => {
    try {
      const customerId = customer.id || customer._id || customer.customerId;
      const qadAndamId = qadAndam.id || qadAndam._id || qadAndam.qadAndamId;
      
      if (!customerId || !qadAndamId) {
        Alert.alert('Error', 'Missing customer or QAD Andam ID');
        return;
      }
      
      await invoiceStore.submitInvoice(customerId, qadAndamId);
      setSuccessModalVisible(true);
    } catch (error) {
      Alert.alert('Error', error.message || invoiceStore.error || 'Failed to create invoice');
    }
  };

  const handleCloseSuccess = () => {
    setSuccessModalVisible(false);
    invoiceStore.resetForm();
    navigation.navigate('CustomerDetails');
  };

  const handleShare = () => {
    // Implement share functionality
    Alert.alert('Share', 'Invoice sharing functionality coming soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Invoice</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.customerSection}>
        <View style={styles.customerBadge}>
          <Ionicons name="person" size={16} color={colors.primary} />
          <Text style={styles.customerText}>{customer.customerName}</Text>
        </View>
        {qadAndam && (
          <View style={styles.qadBadge}>
            <Ionicons name="shirt" size={16} color={colors.secondary} />
            <Text style={styles.qadText}>{qadAndam.qadAndamType}</Text>
          </View>
        )}
      </View>

      <InvoiceForm
        invoiceData={invoiceStore.invoiceData}
        onFieldChange={(field, value) =>
          invoiceStore.setInvoiceField(field, value)
        }
        onSubmit={handleSubmit}
        loading={invoiceStore.loading}
      />

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            </View>

            <Text style={styles.successTitle}>Invoice Created!</Text>

            {invoiceStore.createdInvoice && (
              <View style={styles.invoiceDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice Number:</Text>
                  <Text style={styles.detailValue}>
                    {invoiceStore.createdInvoice.invoiceNumber}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Amount:</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(invoiceStore.createdInvoice.totalAmount)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Paid Amount:</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(invoiceStore.createdInvoice.paidAmount)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
              >
                <Ionicons name="share-social" size={20} color={colors.primary} />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseSuccess}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  customerSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  customerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  customerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  qadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
    gap: spacing.sm,
  },
  qadText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  successModal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.success,
    marginBottom: spacing.lg,
  },
  invoiceDetails: {
    width: '100%',
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.darkGray,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  shareButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: spacing.md,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateInvoiceScreen;

