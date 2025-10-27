import { Alert } from 'react-native';
import { modernTheme } from '../theme/modernTheme';

/**
 * Modern Toast Notification Manager
 * Provides beautiful, non-blocking toast notifications
 */

let toastCallback = null;

export const setToastCallback = (callback) => {
  toastCallback = callback;
};

export const showToast = (options) => {
  const {
    type = 'info', // 'success', 'error', 'warning', 'info'
    message,
    title,
    duration = 3000,
    position = 'top', // 'top', 'bottom', 'center'
  } = options;

  if (toastCallback) {
    toastCallback({
      type,
      message,
      title,
      duration,
      position,
    });
  } else {
    // Fallback to Alert if toast callback not set
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

// Get color for toast type
export const getToastColor = (type) => {
  const colors = {
    success: modernTheme.success,
    error: modernTheme.error,
    warning: modernTheme.warning,
    info: modernTheme.info,
  };
  return colors[type] || modernTheme.info;
};

export const getToastBackgroundColor = (type) => {
  const colors = {
    success: modernTheme.successLight,
    error: modernTheme.errorLight,
    warning: modernTheme.warningLight,
    info: modernTheme.infoLight,
  };
  return colors[type] || modernTheme.infoLight;
};