import { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { createCustomer } from '../services/api';
import { enhancedTheme } from '../theme/enhancedTheme';
import ModernButtonEnhanced from './ui/ModernButtonEnhanced';
import ModernInputEnhanced from './ui/ModernInputEnhanced';
import ModernModal from './ui/ModernModal';

const AddCustomerModal = ({ visible, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = useCallback(() => {
    if (!formData.customerName.trim()) {
      Alert.alert(t('validation.required'), t('addCustomer.firstName') + ' ' + t('validation.required'));
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert(t('validation.required'), t('addCustomer.phone') + ' ' + t('validation.required'));
      return false;
    }
    return true;
  }, [formData, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await createCustomer({
        customerName: formData.customerName.trim(),
        name: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        phone: formData.phoneNumber.trim(),
        address: formData.address.trim() || null,
        balance: 0,
        notes: formData.notes.trim() || null,
      });

      console.log('✓ Customer created successfully:', response.data);
      Alert.alert(t('common.success'), t('addCustomer.customerAdded'));

      // Reset form
      setFormData({
        customerName: '',
        phoneNumber: '',
        address: '',
        notes: '',
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      Alert.alert(t('common.error'), error.message || t('addCustomer.customerAdded'));
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, onClose, onSuccess]);

  const handleClose = useCallback(() => {
    if (!loading) {
      setFormData({
        customerName: '',
        phoneNumber: '',
        address: '',
        notes: '',
      });
      onClose();
    }
  }, [loading, onClose]);

  return (
    <ModernModal
      visible={visible}
      onClose={handleClose}
      title={t('addCustomer.title')}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!loading}
      >
        <View style={styles.formGroup}>
          <ModernInputEnhanced
            placeholder={t('addCustomer.firstName')}
            label={t('addCustomer.fullName')}
            value={formData.customerName}
            onChangeText={(text) => handleInputChange('customerName', text)}
            editable={!loading}
            required
          />
        </View>

        <View style={styles.formGroup}>
          <ModernInputEnhanced
            placeholder={t('addCustomer.phone')}
            label={t('addCustomer.phone')}
            value={formData.phoneNumber}
            onChangeText={(text) => handleInputChange('phoneNumber', text)}
            keyboardType="phone-pad"
            editable={!loading}
            required
          />
        </View>

        <View style={styles.formGroup}>
          <ModernInputEnhanced
            placeholder={t('addCustomer.address')}
            label={t('addCustomer.address')}
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <ModernInputEnhanced
            placeholder={t('qadAndam.notes')}
            label={t('qadAndam.notes')}
            value={formData.notes}
            onChangeText={(text) => handleInputChange('notes', text)}
            multiline
            numberOfLines={3}
            editable={!loading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <ModernButtonEnhanced
            title={loading ? t('common.loading') : t('addCustomer.title')}
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
  buttonContainer: {
    gap: enhancedTheme.spacing.md,
    marginTop: enhancedTheme.spacing.xl,
    marginBottom: enhancedTheme.spacing.xl,
  },
});

export default AddCustomerModal;