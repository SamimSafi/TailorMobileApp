import { AlertCircle, CheckCircle2, CreditCard, DollarSign, FileText } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { enhancedTheme } from '../theme/enhancedTheme';
import { formatCurrency } from '../utils/formatters';
import ModernButtonEnhanced from './ui/ModernButtonEnhanced';
import ModernModal from './ui/ModernModal';

const PaymentModal = ({
  visible,
  invoice,
  loading,
  onSubmit,
  onClose,
}) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible && invoice) {
      // Pre-fill with due amount
      const dueAmount = invoice.dueAmount || (invoice.totalAmount - (invoice.paidAmount || 0));
      setAmount(dueAmount.toString());
      setNotes('');
      setError('');
    }
  }, [visible, invoice]);

  const dueAmount = invoice ? invoice.dueAmount || (invoice.totalAmount - (invoice.paidAmount || 0)) : 0;
  const enteredAmount = parseFloat(amount) || 0;
  const isValidAmount = enteredAmount > 0 && enteredAmount <= dueAmount;

  const handleSubmit = async () => {
    setError('');

    if (!amount || enteredAmount <= 0) {
      setError(t('validation.invalidAmount'));
      return;
    }

    if (enteredAmount > dueAmount) {
      setError(t('validation.invalidAmount'));
      return;
    }

    try {
      await onSubmit({
        invoiceId: invoice.id,
        amount: enteredAmount,
        paymentMethod,
        notes,
      });
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    }
  };

  const handleClose = () => {
    setAmount('');
    setPaymentMethod('cash');
    setNotes('');
    setError('');
    onClose();
  };

  const handleQuickAmount = (percent) => {
    const quickAmount = Math.round((dueAmount * percent) / 100);
    setAmount(quickAmount.toString());
    setError('');
  };

  if (!invoice) return null;

  return (
    <ModernModal
      visible={visible}
      onClose={handleClose}
      title={t('payment.recordPayment')}
    >
      <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={!loading}>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>{t('invoice.invoiceNumber')}</Text>
            <Text style={styles.invoiceValue}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>{t('invoice.total')}</Text>
            <Text style={styles.invoiceValue}>{formatCurrency(invoice.totalAmount)}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>{t('payment.paymentAmount')}</Text>
            <Text style={[styles.invoiceValue, { color: enhancedTheme.colors.success }]}>
              {formatCurrency(invoice.paidAmount || 0)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.invoiceRow}>
            <Text style={[styles.invoiceLabel, styles.dueLabelBold]}>{t('payment.amountToPay')}</Text>
            <Text style={[styles.invoiceValue, styles.dueValueBold]}>
              {formatCurrency(dueAmount)}
            </Text>
          </View>
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountContainer}>
          <Text style={styles.quickAmountLabel}>{t('payment.paymentAmount')}</Text>
          <View style={styles.quickAmountButtons}>
            {[25, 50, 75, 100].map((percent) => (
              <TouchableOpacity
                key={percent}
                style={[
                  styles.quickButton,
                  enteredAmount === Math.round((dueAmount * percent) / 100) &&
                    styles.quickButtonActive,
                ]}
                onPress={() => handleQuickAmount(percent)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.quickButtonText,
                    enteredAmount === Math.round((dueAmount * percent) / 100) &&
                      styles.quickButtonTextActive,
                  ]}
                >
                  {percent}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('payment.paymentAmount')}</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>؋</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={enhancedTheme.colors.border}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setError('');
              }}
              editable={!loading}
            />
          </View>
          {amount && !isValidAmount && (
            <View style={styles.amountWarning}>
              <AlertCircle size={14} color={enhancedTheme.colors.error} />
              <Text style={styles.amountWarningText}>
                {enteredAmount > dueAmount
                  ? `Cannot exceed due amount`
                  : 'Please enter a valid amount'}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('payment.paymentMethod')}</Text>
          <View style={styles.methodContainer}>
            {['cash', 'card', 'cheque'].map((method) => {
              const getIcon = () => {
                if (method === 'cash') return <DollarSign size={20} color={paymentMethod === method ? enhancedTheme.colors.neutral100 : enhancedTheme.colors.neutral700} />;
                if (method === 'card') return <CreditCard size={20} color={paymentMethod === method ? enhancedTheme.colors.neutral100 : enhancedTheme.colors.neutral700} />;
                return <FileText size={20} color={paymentMethod === method ? enhancedTheme.colors.neutral100 : enhancedTheme.colors.neutral700} />;
              };
              return (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.methodButton,
                    paymentMethod === method && styles.methodButtonActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                  disabled={loading}
                >
                  {getIcon()}
                  <Text
                    style={[
                      styles.methodButtonText,
                      paymentMethod === method && styles.methodButtonTextActive,
                    ]}
                  >
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('qadAndam.notes')}</Text>
          <TextInput
            style={styles.notesInput}
            placeholder={t('payment.paymentAmount')}
            placeholderTextColor={enhancedTheme.colors.border}
            value={notes}
            onChangeText={setNotes}
            editable={!loading}
            multiline
          />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color={enhancedTheme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit Buttons */}
        <View style={styles.footer}>
          <ModernButtonEnhanced
            title={t('common.cancel')}
            variant="secondary"
            onPress={handleClose}
            disabled={loading}
          />
          <ModernButtonEnhanced
            title={loading ? '' : t('payment.recordPayment')}
            variant="primary"
            onPress={handleSubmit}
            disabled={!isValidAmount || loading}
            loading={loading}
            icon={!loading ? <CheckCircle2 size={18} /> : undefined}
          />
        </View>
      </ScrollView>
    </ModernModal>
  );
};

const styles = StyleSheet.create({
  invoiceInfo: {
    backgroundColor: enhancedTheme.colors.neutral100,
    marginHorizontal: enhancedTheme.spacing.lg,
    marginVertical: enhancedTheme.spacing.lg,
    borderRadius: enhancedTheme.borderRadius.md,
    padding: enhancedTheme.spacing.lg,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.sm,
  },
  invoiceLabel: {
    fontSize: 13,
    color: enhancedTheme.colors.neutral100,
  },
  invoiceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
  },
  divider: {
    height: 1,
    backgroundColor: enhancedTheme.colors.neutral200,
    marginVertical: enhancedTheme.spacing.sm,
  },
  dueLabelBold: {
    fontWeight: '700',
    color: enhancedTheme.colors.neutral900,
  },
  dueValueBold: {
    fontWeight: '700',
    color: enhancedTheme.colors.error,
    fontSize: 16,
  },
  quickAmountContainer: {
    marginHorizontal: enhancedTheme.spacing.lg,
    marginBottom: enhancedTheme.spacing.lg,
  },
  quickAmountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
    marginBottom: enhancedTheme.spacing.sm,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    gap: enhancedTheme.spacing.sm,
  },
  quickButton: {
    flex: 1,
    paddingVertical: enhancedTheme.spacing.lg,
    borderRadius: enhancedTheme.borderRadius.sm,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
    alignItems: 'center',
  },
  quickButtonActive: {
    backgroundColor: enhancedTheme.colors.primary,
    borderColor: enhancedTheme.colors.primary,
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
  },
  quickButtonTextActive: {
    color: enhancedTheme.colors.neutral100,
  },
  inputSection: {
    marginHorizontal: enhancedTheme.spacing.lg,
    marginBottom: enhancedTheme.spacing.lg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
    marginBottom: enhancedTheme.spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
    borderRadius: enhancedTheme.borderRadius.md,
    paddingHorizontal: enhancedTheme.spacing.lg,
    backgroundColor: enhancedTheme.colors.neutral100,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral600,
    marginRight: enhancedTheme.spacing.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: enhancedTheme.spacing.lg,
    fontSize: 16,
    fontWeight: '700',
    color: enhancedTheme.colors.neutral900,
  },
  amountWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: enhancedTheme.spacing.sm,
    marginTop: enhancedTheme.spacing.sm,
    paddingHorizontal: enhancedTheme.spacing.sm,
  },
  amountWarningText: {
    fontSize: 12,
    color: enhancedTheme.colors.error,
    flex: 1,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: enhancedTheme.spacing.sm,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: enhancedTheme.spacing.lg,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
    borderRadius: enhancedTheme.borderRadius.md,
    backgroundColor: enhancedTheme.colors.neutral100,
  },
  methodButtonActive: {
    backgroundColor: enhancedTheme.colors.primary,
    borderColor: enhancedTheme.colors.primary,
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
    marginTop: enhancedTheme.spacing.xs,
  },
  methodButtonTextActive: {
    color: enhancedTheme.colors.neutral100,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
    borderRadius: enhancedTheme.borderRadius.md,
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.lg,
    fontSize: 14,
    color: enhancedTheme.colors.neutral900,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: enhancedTheme.spacing.sm,
    marginHorizontal: enhancedTheme.spacing.lg,
    marginBottom: enhancedTheme.spacing.lg,
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.sm,
    backgroundColor: enhancedTheme.colors.error + '15',
    borderRadius: enhancedTheme.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: enhancedTheme.colors.error,
  },
  errorText: {
    fontSize: 13,
    color: enhancedTheme.colors.error,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: enhancedTheme.spacing.lg,
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: enhancedTheme.colors.neutral200,
  },
});

export default PaymentModal;