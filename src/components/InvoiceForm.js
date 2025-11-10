import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { enhancedTheme } from '../theme/enhancedTheme';
import { validateInvoiceForm } from '../utils/validators';
import ModernButtonEnhanced from './ui/ModernButtonEnhanced';
import ModernInputEnhanced from './ui/ModernInputEnhanced';

const InvoiceForm = ({
  invoiceData,
  onFieldChange,
  onSubmit,
  loading = false,
}) => {
  const { t } = useLanguage();
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [errors, setErrors] = useState({});

  const handleDueDateChange = (event, selectedDate) => {
    setShowDueDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onFieldChange('dueDate', dateString);
    }
  };

  const handleReturnDateChange = (event, selectedDate) => {
    setShowReturnDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onFieldChange('returnDate', dateString);
    }
  };

  const handleSubmit = () => {
    const validation = validateInvoiceForm(invoiceData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      Alert.alert(t('common.error'), t('validation.required'));
      return;
    }
    setErrors({});
    onSubmit();
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return t('dateTime.today');
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Total Amount */}
        <ModernInputEnhanced
          label={t('invoice.total')}
          placeholder={t('invoice.total')}
          value={invoiceData.totalAmount}
          onChangeText={(value) => onFieldChange('totalAmount', value)}
          keyboardType="decimal-pad"
          editable={!loading}
          required
          error={errors.totalAmount}
        />

        {/* Paid Amount */}
        <ModernInputEnhanced
          label={t('payment.paymentAmount')}
          placeholder={t('payment.paymentAmount')}
          value={invoiceData.paidAmount}
          onChangeText={(value) => onFieldChange('paidAmount', value)}
          keyboardType="decimal-pad"
          editable={!loading}
          error={errors.paidAmount}
        />

        {/* Due Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t('invoice.dueDate')} <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.dueDate && styles.dateButtonError]}
            onPress={() => setShowDueDatePicker(true)}
            disabled={loading}
          >
            <Calendar size={18} color={enhancedTheme.colors.neutral600} />
            <Text style={styles.dateButtonText}>
              {formatDateForDisplay(invoiceData.dueDate)}
            </Text>
          </TouchableOpacity>
          {errors.dueDate && (
            <Text style={styles.errorText}>{errors.dueDate}</Text>
          )}
        </View>

        {showDueDatePicker && (
          <DateTimePicker
            value={
              invoiceData.dueDate
                ? new Date(invoiceData.dueDate)
                : new Date()
            }
            mode="date"
            display="spinner"
            onChange={handleDueDateChange}
          />
        )}

        {/* Return Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t('dateTime.today')} <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.returnDate && styles.dateButtonError]}
            onPress={() => setShowReturnDatePicker(true)}
            disabled={loading}
          >
            <Calendar size={18} color={enhancedTheme.colors.neutral600} />
            <Text style={styles.dateButtonText}>
              {formatDateForDisplay(invoiceData.returnDate)}
            </Text>
          </TouchableOpacity>
          {errors.returnDate && (
            <Text style={styles.errorText}>{errors.returnDate}</Text>
          )}
        </View>

        {showReturnDatePicker && (
          <DateTimePicker
            value={
              invoiceData.returnDate
                ? new Date(invoiceData.returnDate)
                : new Date()
            }
            mode="date"
            display="spinner"
            onChange={handleReturnDateChange}
          />
        )}

        {/* Jora Count */}
        <ModernInputEnhanced
          label={t('qadAndam.measurements')}
          placeholder={t('qadAndam.measurements')}
          value={invoiceData.joraCount}
          onChangeText={(value) => onFieldChange('joraCount', value)}
          keyboardType="number-pad"
          editable={!loading}
          error={errors.joraCount}
        />

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <ModernButtonEnhanced
            title={loading ? t('common.loading') : t('invoice.title')}
            variant="primary"
            onPress={handleSubmit}
            disabled={loading}
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: enhancedTheme.colors.neutral50,
  },
  form: {
    padding: enhancedTheme.spacing.lg,
  },
  field: {
    marginBottom: enhancedTheme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
    marginBottom: enhancedTheme.spacing.sm,
  },
  required: {
    color: enhancedTheme.colors.error,
  },
  dateButton: {
    backgroundColor: enhancedTheme.colors.surface,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
    borderRadius: enhancedTheme.borderRadius.md,
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.lg,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: enhancedTheme.spacing.md,
  },
  dateButtonError: {
    borderColor: enhancedTheme.colors.error,
  },
  dateButtonText: {
    fontSize: 16,
    color: enhancedTheme.colors.neutral900,
    flex: 1,
  },
  errorText: {
    color: enhancedTheme.colors.error,
    fontSize: 12,
    marginTop: enhancedTheme.spacing.xs,
  },
  submitContainer: {
    marginTop: enhancedTheme.spacing.xl,
    marginBottom: enhancedTheme.spacing.lg,
  },
});

export default InvoiceForm;

