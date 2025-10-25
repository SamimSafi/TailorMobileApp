import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { validateInvoiceForm } from '../utils/validators';

const InvoiceForm = ({
  invoiceData,
  onFieldChange,
  onSubmit,
  loading = false,
}) => {
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
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }
    setErrors({});
    onSubmit();
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Select Date';
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
        <View style={styles.field}>
          <Text style={styles.label}>
            Total Amount <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.totalAmount && styles.inputError]}
            placeholder="Enter total amount"
            placeholderTextColor={colors.darkGray}
            value={invoiceData.totalAmount}
            onChangeText={(value) => onFieldChange('totalAmount', value)}
            keyboardType="decimal-pad"
            editable={!loading}
          />
          {errors.totalAmount && (
            <Text style={styles.errorText}>{errors.totalAmount}</Text>
          )}
        </View>

        {/* Paid Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>Paid Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter paid amount"
            placeholderTextColor={colors.darkGray}
            value={invoiceData.paidAmount}
            onChangeText={(value) => onFieldChange('paidAmount', value)}
            keyboardType="decimal-pad"
            editable={!loading}
          />
          {errors.paidAmount && (
            <Text style={styles.errorText}>{errors.paidAmount}</Text>
          )}
        </View>

        {/* Due Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Due Date <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.dueDate && styles.inputError]}
            onPress={() => setShowDueDatePicker(true)}
            disabled={loading}
          >
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
            Return Date <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.returnDate && styles.inputError]}
            onPress={() => setShowReturnDatePicker(true)}
            disabled={loading}
          >
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
        <View style={styles.field}>
          <Text style={styles.label}>Jora Count</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter jora count"
            placeholderTextColor={colors.darkGray}
            value={invoiceData.joraCount}
            onChangeText={(value) => onFieldChange('joraCount', value)}
            keyboardType="number-pad"
            editable={!loading}
          />
          {errors.joraCount && (
            <Text style={styles.errorText}>{errors.joraCount}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating Invoice...' : 'Create Invoice'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    padding: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  dateButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InvoiceForm;

