import { useToast } from 'native-base';
import { useEffect } from 'react';
import { setToastRef } from '../../utils/toastManager';

/**
 * Native Base Toast Component
 * Integrates Native Base's useToast hook with our toast manager
 */
const ModernToast = () => {
  console.log('🚀 [STARTUP] ModernToast - Component initialized');
  
  const toast = useToast();

  useEffect(() => {
    console.log('🚀 [STARTUP] ModernToast - useEffect running, registering toast ref');
    
    if (!toast) {
      console.warn('⚠️ [WARNING] ModernToast - toast is null/undefined');
      return;
    }

    try {
      // Register toast ref with toastManager for global access
      setToastRef(toast);
      console.log('🚀 [STARTUP] ModernToast - Toast ref registered successfully');
    } catch (error) {
      console.error('❌ [ERROR] ModernToast - Setup failed:', error);
    }

    return () => {
      try {
        setToastRef(null);
      } catch (error) {
        console.warn('⚠️ [WARNING] ModernToast - Cleanup failed:', error);
      }
    };
  }, [toast]);

  return null;
};

export default ModernToast;