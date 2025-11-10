import { Alert } from 'react-native';

/**
 * Native Base Toast Manager
 * Provides beautiful toast notifications using Native Base
 */

let toastRef = null;

export const setToastRef = (ref) => {
  toastRef = ref;
};

export const showToast = (options) => {
  if (!options || typeof options !== 'object') {
    console.warn('⚠️ [TOAST] showToast called with invalid options:', typeof options);
    return;
  }

  const {
    type = 'info', // 'success', 'error', 'warning', 'info'
    message,
    title,
    duration = 3000,
    position = 'top', // 'top', 'bottom'
  } = options;

  if (toastRef && typeof toastRef.show === 'function') {
    try {
      toastRef.show({
        title: title || 'Notification',
        description: message || '',
        status: type,
        duration,
        isClosable: true,
        variant: 'subtle',
        placement: position === 'top' ? 'top' : 'bottom',
      });
    } catch (error) {
      console.error('❌ [TOAST] Error showing toast:', error);
      fallbackAlert(type, title, message);
    }
  } else {
    // Fallback to Alert if toast ref not set
    console.warn('⚠️ [TOAST] Toast ref not available, using fallback alert');
    fallbackAlert(type, title, message);
  }
};

export const toastSuccess = (message, title = 'Success', duration = 3000) => {
  showToast({
    type: 'success',
    title,
    message,
    duration,
  });
};

export const toastError = (message, title = 'Error', duration = 4000) => {
  showToast({
    type: 'error',
    title,
    message,
    duration,
  });
};

export const toastWarning = (message, title = 'Warning', duration = 3500) => {
  showToast({
    type: 'warning',
    title,
    message,
    duration,
  });
};

export const toastInfo = (message, title = 'Info', duration = 3000) => {
  showToast({
    type: 'info',
    title,
    message,
    duration,
  });
};

export const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
  Alert.alert(title, message, buttons);
};

export const showConfirm = (title, message, onConfirm, onCancel) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        onPress: onCancel,
        style: 'cancel',
      },
      {
        text: 'Confirm',
        onPress: onConfirm,
        style: 'default',
      },
    ],
    { cancelable: false }
  );
};

const fallbackAlert = (type, title, message) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  Alert.alert(
    `${icons[type]} ${title}`,
    message,
    [{ text: 'Dismiss', style: 'default' }]
  );
};

// Legacy compatibility - these are no longer needed with Native Base
export const getToastColor = (type) => {
  const colors = {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFA726',
    info: '#2196F3',
  };
  return colors[type] || '#2196F3';
};

export const getToastBackgroundColor = (type) => {
  const colors = {
    success: '#E8F5E9',
    error: '#FFEBEE',
    warning: '#FFF3E0',
    info: '#E3F2FD',
  };
  return colors[type] || '#E3F2FD';
};