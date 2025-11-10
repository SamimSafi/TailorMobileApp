/**
 * useKeyboard Hook
 * Handles keyboard visibility and manages form interactions
 */

import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export const useKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates?.height || 0);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const dismissKeyboard = () => Keyboard.dismiss();

  return { isKeyboardVisible, keyboardHeight, dismissKeyboard };
};

/**
 * useFormField Hook
 * Manages individual form field state
 */
export const useFormField = (initialValue = '', validator = null) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validate = () => {
    if (validator) {
      const validationError = validator(value);
      setError(validationError);
      return !validationError;
    }
    return true;
  };

  const handleChange = (text) => {
    setValue(text);
    if (isDirty && error) {
      validate();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsDirty(true);
    validate();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const reset = () => {
    setValue(initialValue);
    setError('');
    setIsDirty(false);
  };

  return {
    value,
    setValue,
    error,
    setError,
    isFocused,
    isDirty,
    handleChange,
    handleFocus,
    handleBlur,
    validate,
    reset,
  };
};

/**
 * useForm Hook
 * Manages complete form state
 */
export const useForm = (initialValues = {}, onSubmit = null, validators = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name] && errors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validateField = (name, value) => {
    const validator = validators[name];
    if (validator) {
      const error = validator(value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
      return !error;
    }
    return true;
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validators).forEach((name) => {
      const error = validators[name](values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
};

export default useKeyboard;