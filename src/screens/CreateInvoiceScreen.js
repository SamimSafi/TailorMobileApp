import { CheckCircle, ChevronLeft, Share2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InvoiceForm from '../components/InvoiceForm';
import ModernBadge from '../components/ui/ModernBadge';
import ModernButtonEnhanced from '../components/ui/ModernButtonEnhanced';
import ModernModal from '../components/ui/ModernModal';
import { useLanguage } from '../hooks/useLanguage';
import { useCustomerStore } from '../store/customerStore';
import { useInvoiceStore } from '../store/invoiceStore';
import { enhancedTheme, spacing, typography } from '../theme/enhancedTheme';
import { modernTheme } from '../theme/modernTheme';
import { formatCurrency } from '../utils/formatters';
import { toastError, toastSuccess } from '../utils/toastManager';

const CreateInvoiceScreen = ({ navigation, route }) => {
  // Localization
  const { t } = useLanguage();
  
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
        toastError('Missing customer or QAD Andam ID');
        return;
      }
      
      await invoiceStore.submitInvoice(customerId, qadAndamId);
      setSuccessModalVisible(true);
    } catch (error) {
      toastError(error.message || invoiceStore.error || 'Failed to create invoice');
    }
  };

  const handleCloseSuccess = () => {
    setSuccessModalVisible(false);
    invoiceStore.resetForm();
    navigation.navigate('CustomerDetails');
  };

  const handleShare = () => {
    toastSuccess('Invoice sharing functionality coming soon!');
  };

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
            <Text style={[styles.headerTitle, { color: '#ffffff' }]}>{t('invoice.title')}</Text>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>{t('common.search')}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{t('invoice.invoiceNumber')}</Text>
          <View style={styles.badgesContainer}>
            <ModernBadge 
              text={customer.customerName}
              variant="primary"
              size="lg"
            />
            {qadAndam && (
              <ModernBadge 
                text={qadAndam.qadAndamType}
                variant="secondary"
                size="lg"
              />
            )}
          </View>
        </View>

        {/* Invoice Form */}
        <View style={styles.formSection}>
          <InvoiceForm
            invoiceData={invoiceStore.invoiceData}
            onFieldChange={(field, value) =>
              invoiceStore.setInvoiceField(field, value)
            }
            onSubmit={handleSubmit}
            loading={invoiceStore.loading}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <ModernButtonEnhanced
            title={invoiceStore.loading ? t('common.loading') : t('invoice.title')}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={invoiceStore.loading}
            disabled={invoiceStore.loading}
          />
        </View>
      </ScrollView>

      {/* Success Modal */}
      <ModernModal
        visible={successModalVisible}
        onClose={handleCloseSuccess}
        title={"🎉 " + t('invoice.invoiceCreated')}
        subtitle={t('invoice.invoiceSaved')}
        size="md"
      >
        {invoiceStore.createdInvoice && (
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <CheckCircle size={64} color={enhancedTheme.colors.success} />
            </View>

            <View style={[styles.invoiceDetails, { backgroundColor: enhancedTheme.colors.neutral100 }]}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('invoice.invoiceNumber')}</Text>
                <Text style={styles.detailValue}>
                  {invoiceStore.createdInvoice.invoiceNumber}
                </Text>
              </View>
              <View style={[styles.detailRow, styles.detailRowBorder]}>
                <Text style={styles.detailLabel}>{t('invoice.total')}</Text>
                <Text style={[styles.detailValue, { color: enhancedTheme.colors.success }]}>
                  {formatCurrency(invoiceStore.createdInvoice.totalAmount)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('payment.paymentAmount')}</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(invoiceStore.createdInvoice.paidAmount)}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <ModernButtonEnhanced
                title={t('actions.share')}
                onPress={handleShare}
                variant="secondary"
                size="md"
                icon={Share2}
                fullWidth
              />
              <ModernButtonEnhanced
                title={t('common.ok')}
                onPress={handleCloseSuccess}
                variant="primary"
                size="md"
                fullWidth
              />
            </View>
          </View>
        )}
      </ModernModal>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headlineSmall,
    color: modernTheme.text,
    marginBottom: spacing.md,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    marginVertical: spacing.lg,
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  invoiceDetails: {
    width: '100%',
    backgroundColor: modernTheme.background,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.divider,
    marginBottom: spacing.md,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    ...typography.bodyMedium,
    color: modernTheme.text,
    fontWeight: '700',
  },
  modalButtonContainer: {
    width: '100%',
    gap: spacing.md,
  },
});

export default CreateInvoiceScreen;

