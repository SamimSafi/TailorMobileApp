import { CameraView, useCameraPermissions } from 'expo-camera';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { enhancedTheme } from '../theme/enhancedTheme';

const BarcodeScanner = ({ visible, onClose, onScan }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
  }, [visible, permission]);

  const handleBarCodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      onScan(data);
      setTimeout(() => {
        onClose();
        setScanned(false);
      }, 500);
    }
  };

  if (!permission) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={enhancedTheme.colors.surface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.content}>
            <Text style={styles.text}>Camera permission is required</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={enhancedTheme.colors.surface} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.content}>
            <Text style={styles.text}>Camera access is denied</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={requestPermission}
            >
              <Text style={styles.buttonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={enhancedTheme.colors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <View style={{ width: 24 }} />
        </View>
        <CameraView
          style={styles.camera}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'code128', 'code39', 'ean13'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
        </CameraView>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {scanned ? 'Processing...' : 'Point camera at QR code'}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: enhancedTheme.colors.neutral900,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.lg,
    backgroundColor: enhancedTheme.colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: enhancedTheme.colors.surface,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: enhancedTheme.colors.success,
    borderRadius: enhancedTheme.borderRadius.lg,
    backgroundColor: 'transparent',
  },
  footer: {
    paddingVertical: enhancedTheme.spacing.lg,
    paddingHorizontal: enhancedTheme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
  },
  footerText: {
    color: enhancedTheme.colors.surface,
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: enhancedTheme.spacing.md,
  },
  text: {
    fontSize: 16,
    color: enhancedTheme.colors.surface,
    marginBottom: enhancedTheme.spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: enhancedTheme.colors.primary,
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.md,
    borderRadius: enhancedTheme.borderRadius.md,
  },
  buttonText: {
    color: enhancedTheme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BarcodeScanner;

