import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { formatCurrency } from '../utils/formatters';

const PaymentModal = ({
  visible,
  invoice,
  loading,
  onSubmit,
  onClose,
}) => {
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
      setError('Please enter a valid amount');
      return;
    }

    if (enteredAmount > dueAmount) {
      setError(`Amount cannot exceed due amount (${formatCurrency(dueAmount)})`);
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
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        {/* Handle Bar */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Record Payment</Text>
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Invoice Number</Text>
            <Text style={styles.invoiceValue}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Total Amount</Text>
            <Text style={styles.invoiceValue}>{formatCurrency(invoice.totalAmount)}</Text>
          </View>
          <View style={styles.invoiceRow}>
            <Text style={styles.invoiceLabel}>Paid Amount</Text>
            <Text style={[styles.invoiceValue, { color: colors.success }]}>
              {formatCurrency(invoice.paidAmount || 0)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.invoiceRow}>
            <Text style={[styles.invoiceLabel, styles.dueLabelBold]}>Due Amount</Text>
            <Text style={[styles.invoiceValue, styles.dueValueBold]}>
              {formatCurrency(dueAmount)}
            </Text>
          </View>
        </View>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmountContainer}>
          <Text style={styles.quickAmountLabel}>Quick Amount</Text>
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
          <Text style={styles.inputLabel}>Payment Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>Rs.</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={colors.border}
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
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
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
          <Text style={styles.inputLabel}>Payment Method</Text>
          <View style={styles.methodContainer}>
            {['cash', 'card', 'cheque'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.methodButton,
                  paymentMethod === method && styles.methodButtonActive,
                ]}
                onPress={() => setPaymentMethod(method)}
                disabled={loading}
              >
                <Ionicons
                  name={
                    method === 'cash'
                      ? 'cash-outline'
                      : method === 'card'
                        ? 'card-outline'
                        : 'document-text-outline'
                  }
                  size={20}
                  color={paymentMethod === method ? colors.white : colors.darkGray}
                />
                <Text
                  style={[
                    styles.methodButtonText,
                    paymentMethod === method && styles.methodButtonTextActive,
                  ]}
                >
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add payment notes..."
            placeholderTextColor={colors.border}
            value={notes}
            onChangeText={setNotes}
            editable={!loading}
            multiline
          />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValidAmount || loading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValidAmount || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>Confirm Payment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: 'auto',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  invoiceInfo: {
    backgroundColor: colors.lightGray,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 8,
    padding: spacing.md,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  invoiceLabel: {
    fontSize: 13,
    color: colors.darkGray,
  },
  invoiceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  dueLabelBold: {
    fontWeight: '700',
    color: colors.text,
  },
  dueValueBold: {
    fontWeight: '700',
    color: colors.error,
    fontSize: 16,
  },
  quickAmountContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  quickAmountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  quickButtonTextActive: {
    color: colors.white,
  },
  inputSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkGray,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  amountWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  amountWarningText: {
    fontSize: 12,
    color: colors.error,
    flex: 1,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  methodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.xs,
  },
  methodButtonTextActive: {
    color: colors.white,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.error + '10',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.success,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default PaymentModal;