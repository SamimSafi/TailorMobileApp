import { Picker } from '@react-native-picker/picker';
import { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { createQadAndam } from '../services/api';
import { enhancedTheme } from '../theme/enhancedTheme';
import ModernButtonEnhanced from './ui/ModernButtonEnhanced';
import ModernInputEnhanced from './ui/ModernInputEnhanced';
import ModernModal from './ui/ModernModal';

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
  const { t } = useLanguage();
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
      Alert.alert(t('common.error'), t('validation.required'));
      return false;
    }
    return true;
  }, [totalAmount, t]);

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
      Alert.alert(t('common.success'), t('qadAndam.measurementAdded'));

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
      Alert.alert(t('common.error'), error.message || t('qadAndam.measurementAdded'));
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

  return (
    <ModernModal
      visible={visible}
      onClose={handleClose}
      title={t('qadAndam.addMeasurement')}
    >

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!loading}
        >
          {/* Qad Andam Type Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('qadAndam.measurement')} *</Text>
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
            <Text style={styles.sectionTitle}>{t('qadAndam.measurements')}</Text>
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
                        <Picker.Item label={t('common.select')} value="" />
                        {config.options.map((option) => (
                          <Picker.Item key={option} label={option} value={option} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                );
              }

              return (
                <ModernInputEnhanced
                  key={fieldName}
                  label={config.label}
                  placeholder={config.label}
                  value={measurements[fieldName] || ''}
                  onChangeText={(text) => handleMeasurementChange(fieldName, text)}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              );
            })}
          </View>

          {/* Amount Fields */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>{t('invoice.items')}</Text>

            <ModernInputEnhanced
              label={t('invoice.total')}
              placeholder={t('invoice.total')}
              value={totalAmount}
              onChangeText={setTotalAmount}
              keyboardType="decimal-pad"
              editable={!loading}
              required
            />

            <ModernInputEnhanced
              label={t('payment.paymentAmount')}
              placeholder={t('payment.paymentAmount')}
              value={paidAmount}
              onChangeText={setPaidAmount}
              keyboardType="decimal-pad"
              editable={!loading}
            />

            <ModernInputEnhanced
              label={t('qadAndam.measurement')}
              placeholder={t('qadAndam.measurement')}
              value={joraCount}
              onChangeText={setJoraCount}
              keyboardType="number-pad"
              editable={!loading}
            />

            <ModernInputEnhanced
              label={t('qadAndam.notes')}
              placeholder={t('qadAndam.notes')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          <View style={styles.buttonContainer}>
            <ModernButtonEnhanced
              title={loading ? t('common.loading') : t('qadAndam.addMeasurement')}
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              disabled={loading}
              loading={loading}
              fullWidth
            />
            <ModernButtonEnhanced
              title={t('common.cancel')}
              onPress={handleClose}
              variant="secondary"
              size="lg"
              disabled={loading}
              fullWidth
            />
          </View>
        </ScrollView>
    </ModernModal>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: enhancedTheme.spacing.lg,
  },
  formGroup: {
    marginBottom: enhancedTheme.spacing.lg,
  },
  label: {
    fontSize: enhancedTheme.typography.labelLarge.fontSize,
    fontWeight: enhancedTheme.typography.labelLarge.fontWeight,
    color: enhancedTheme.colors.neutral700,
    marginBottom: enhancedTheme.spacing.xs,
  },
  pickerContainer: {
    backgroundColor: enhancedTheme.colors.surface,
    borderRadius: enhancedTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral300,
    overflow: 'hidden',
  },
  picker: {
    color: enhancedTheme.colors.neutral900,
  },
  sectionTitle: {
    fontSize: enhancedTheme.typography.headlineMedium.fontSize,
    fontWeight: enhancedTheme.typography.headlineMedium.fontWeight,
    color: enhancedTheme.colors.primary,
    marginBottom: enhancedTheme.spacing.md,
    marginTop: enhancedTheme.spacing.lg,
  },
  measurementsSection: {
    paddingBottom: enhancedTheme.spacing.lg,
  },
  amountSection: {
    paddingBottom: enhancedTheme.spacing.lg,
  },
  buttonContainer: {
    gap: enhancedTheme.spacing.md,
    marginTop: enhancedTheme.spacing.xl,
    marginBottom: enhancedTheme.spacing.xl,
  },
});

export default AddQadAndamModal;