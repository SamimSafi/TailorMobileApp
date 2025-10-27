import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { createQadAndam } from '../services/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const qadAndamTypes = ['Kala', 'Darishi', 'Waskat', 'Kurti'];

const typeFields = {
  Kala: [
    'qad',
    'shana',
    'astin',
    'yakhan',
    'baghal',
    'daman',
    'qadTunban',
    'pacha',
    'jebRoy',
    'damanNew',
    'naweyatKala',
    'chamakTar',
    'naweyatTunban',
    'astinF',
    'qol',
    'bazo',
    'paty',
    'naweyatDukma',
    'naweyatPacha',
    'naweyatPaty',
  ],
  Darishi: ['qad', 'shana', 'baghal', 'yakhan', 'daman'],
  Waskat: ['qad', 'shana', 'baghal', 'daman', 'yakhan'],
  Kurti: ['qad', 'shana', 'astin', 'baghal', 'daman'],
};

const fieldConfigs = {
  qad: { type: 'number', label: 'قد' },
  shana: { type: 'number', label: 'شانه' },
  astin: { type: 'number', label: 'آستین' },
  yakhan: { type: 'number', label: 'یخن' },
  baghal: { type: 'number', label: 'بغل' },
  daman: { type: 'number', label: 'دامن' },
  qadTunban: { type: 'number', label: 'تمبان' },
  pacha: { type: 'number', label: 'پاچه' },
  qol: { type: 'number', label: 'قول' },
  paty: {
    type: 'dropdown',
    label: 'پتی',
    options: ['11.5', '12.5', '13.5', '14.5', '15.5', '16.5', '17.5'],
  },
  naweyatKala: {
    type: 'dropdown',
    label: 'نوعیت یخن',
    options: [
      'کالر',
      'نیمه بین',
      'بین',
      'کت کالر',
      'نوکدار کالر',
      'تری پل کالر',
      'قاسیمی',
      'کالر قاسیمی',
      'قاسیمی بین خورد',
      'هندی',
      'قاسیمی هندی',
      'هندی کالر',
      'هندی بندک دار',
      'هندی بین خورد',
      'عربی یخن',
      'کالر گول دکمه دار',
      'سینه پور',
      'سینه پور ساده',
      'بین خورد',
      'بین چهار کنج',
    ],
  },
  bazo: {
    type: 'dropdown',
    label: 'فرمایش بازو',
    options: ['اوریب', 'آزاد'],
  },
  astinF: {
    type: 'dropdown',
    label: 'نوعیت آستین',
    options: [
      'کفدار',
      'کف چسپ',
      'کف گول',
      'کفدار چهار کنج',
      'کف چسپ چهار کنج',
      'کف گول چسپ',
      'آستین سه قات',
      'آستین گول',
      'آستین میجه',
      'کف میجه',
      'آستین بندک دار',
      'آستین سمبوسه',
      'کت کف',
      'دبل کف',
      'دبل گاج',
      'چکپتی بی گاج',
      'چک پتی دبل گاج',
      '2002',
      'ساده',
    ],
  },
  jebRoy: {
    type: 'dropdown',
    label: 'نوعیت جیب',
    options: ['جیب روی', 'جیب بغل یک', 'جیب بغل دوو', 'دبل جیب'],
  },
  damanNew: {
    type: 'dropdown',
    label: 'نوعیت دامن',
    options: [
      'دامن گول',
      'دامن چهار کنج',
      'دامن تریزدار',
      'تریزدار قات',
      'تریزدار دبل',
      'تریزدار سینگل',
      'الفجر',
      'تریزدار گول',
      'تریزدار چهار کنج',
      'گول تریزدار چهار کنج',
      'گول چهار کنج',
    ],
  },
  naweyatTunban: {
    type: 'dropdown',
    label: 'نوعیت تمبان',
    options: [
      'جیب تمبان',
      'عام تمبان',
      'بر تمبان',
      'دبل سلایی',
      'گیبی',
      'نیمه گیبی',
      'پتلونی',
      'جیب تمبان گیبی',
      'چهار درز',
    ],
  },
  chamakTar: {
    type: 'dropdown',
    label: 'نوعیت چمک',
    options: ['چمک تار', 'دبل', 'تریپل', 'گلدوزی'],
  },
  naweyatDukma: {
    type: 'dropdown',
    label: 'نوعیت توکمه',
    options: ['توکمه ساده', 'توکمه دیزاین دار', 'رینگ بتن'],
  },
  naweyatPacha: {
    type: 'dropdown',
    label: 'نوعیت پاچه',
    options: ['پاچه ساده قات', 'جیب بی لیبل', 'جیب تومبان'],
  },
  naweyatPaty: {
    type: 'dropdown',
    label: 'نوعیت پتی',
    options: [
      'یک اینچ',
      'نیم اینچ',
      'یک سوت کم 1اینچ',
      'دوو سوت کم 1 اینچ',
      'سه سوت کم یک اینچ',
      'یک نیم اینچ',
    ],
  },
};

const AddQadAndamModal = ({ visible, onClose, customerId, onSuccess }) => {
  const [qadAndamType, setQadAndamType] = useState('Kala');
  const [measurements, setMeasurements] = useState({});
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [joraCount, setJoraCount] = useState('2');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const fieldsForType = useMemo(() => typeFields[qadAndamType] || [], [qadAndamType]);

  const validateForm = useCallback(() => {
    if (!totalAmount.trim()) {
      Alert.alert('Validation Error', 'Total amount is required');
      return false;
    }
    return true;
  }, [totalAmount]);

  const handleMeasurementChange = (field, value) => {
    setMeasurements((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Build measurements object with all required fields
      const allMeasurements = {};
      Object.keys(fieldConfigs).forEach((field) => {
        allMeasurements[field] = measurements[field] || 0;
      });

      const response = await createQadAndam({
        customerId,
        qadAndamType,
        measurements: allMeasurements,
        totalAmount: parseInt(totalAmount, 10),
        paidAmount: parseInt(paidAmount, 10) || 0,
        joraCount: parseInt(joraCount, 10) || 2,
        dueDate: new Date().toISOString(),
        description: description.trim() || null,
        returnDate: null,
        enterDate: new Date().toISOString(),
      });

      console.log('✓ Qad Andam created successfully:', response.data);
      Alert.alert('Success', 'Measurement registered successfully');

      // Reset form
      setMeasurements({});
      setTotalAmount('');
      setPaidAmount('0');
      setJoraCount('2');
      setDescription('');

      if (onSuccess) {
        onSuccess(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Error creating qad andam:', error);
      Alert.alert('Error', error.message || 'Failed to register measurement');
    } finally {
      setLoading(false);
    }
  }, [customerId, qadAndamType, measurements, totalAmount, paidAmount, joraCount, description, validateForm, onClose, onSuccess]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setMeasurements({});
      setTotalAmount('');
      setPaidAmount('0');
      setJoraCount('2');
      setDescription('');
      onClose();
    }
  }, [loading, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={loading}>
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Measurement (Qad Andam)</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!loading}
        >
          {/* Qad Andam Type Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Measurement Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={qadAndamType}
                onValueChange={setQadAndamType}
                enabled={!loading}
                style={styles.picker}
              >
                {qadAndamTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Measurements Fields */}
          <View style={styles.measurementsSection}>
            <Text style={styles.sectionTitle}>Measurements</Text>
            {fieldsForType.map((fieldName) => {
              const config = fieldConfigs[fieldName];
              if (!config) return null;

              if (config.type === 'dropdown') {
                return (
                  <View key={fieldName} style={styles.formGroup}>
                    <Text style={styles.label}>{config.label}</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={measurements[fieldName] || ''}
                        onValueChange={(value) => handleMeasurementChange(fieldName, value)}
                        enabled={!loading}
                        style={styles.picker}
                      >
                        <Picker.Item label="-- Select --" value="" />
                        {config.options.map((option) => (
                          <Picker.Item key={option} label={option} value={option} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                );
              }

              return (
                <View key={fieldName} style={styles.formGroup}>
                  <Text style={styles.label}>{config.label}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter ${config.label}`}
                    placeholderTextColor={colors.lightGray}
                    value={measurements[fieldName] || ''}
                    onChangeText={(text) => handleMeasurementChange(fieldName, text)}
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              );
            })}
          </View>

          {/* Amount Fields */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Amount & Details</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Total Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter total amount"
                placeholderTextColor={colors.lightGray}
                value={totalAmount}
                onChangeText={setTotalAmount}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Paid Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter paid amount"
                placeholderTextColor={colors.lightGray}
                value={paidAmount}
                onChangeText={setPaidAmount}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Pieces (Jora Count)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter number of pieces"
                placeholderTextColor={colors.lightGray}
                value={joraCount}
                onChangeText={setJoraCount}
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Enter description (optional)"
                placeholderTextColor={colors.lightGray}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="checkmark" size={20} color={colors.white} />
            )}
            <Text style={styles.submitButtonText}>
              {loading ? 'Creating...' : 'Register Measurement'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, loading && styles.cancelButtonDisabled]}
            onPress={handleClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 40,
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
    padding: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.lightGray,
    color: colors.text,
  },
  multilineInput: {
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: 'hidden',
  },
  picker: {
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  measurementsSection: {
    paddingBottom: spacing.lg,
  },
  amountSection: {
    paddingBottom: spacing.lg,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default AddQadAndamModal;