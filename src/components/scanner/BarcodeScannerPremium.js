/**
 * PREMIUM BARCODE SCANNER
 * Professional barcode scanner interface with:
 * - Animated scanning frame with pulsating effect
 * - Torch control with smooth animation
 * - Manual input fallback
 * - Success/error states with haptic feedback
 * - Excellent UX for low-light conditions
 */

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import {
  borderRadius,
  colors,
  spacing,
  typography
} from '../../theme/enhancedTheme';

const supportedBarcodeTypes = [
  'aztec',
  'ean13',
  'ean8',
  'qr',
  'pdf417',
  'upc_e',
  'datamatrix',
  'code39',
  'code93',
  'itf14',
  'codabar',
  'code128',
  'upc_a',
];

const defaultBarcodeTypes = ['qr', 'code128', 'code39', 'ean13'];

const sanitizeBarcodeTypes = (types) => {
  if (!Array.isArray(types) || types.length === 0) {
    return defaultBarcodeTypes;
  }

  const normalized = types
    .map((type) => String(type).trim().toLowerCase())
    .filter(Boolean);

  if (normalized.includes('all')) {
    return supportedBarcodeTypes;
  }

  const filtered = normalized.filter((type) => supportedBarcodeTypes.includes(type));

  return filtered.length > 0 ? filtered : defaultBarcodeTypes;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const roundZoom = (value) => Number(value.toFixed(3));

const MIN_ZOOM = 0;
const MAX_ZOOM = 0.95;
const ZOOM_STEP = 0.08;

const BarcodeScannerPremium = ({
  isVisible = false,
  onClose = () => {},
  onBarcodeScanned = null,
  onScan = null,
  title = 'Scan Barcode',
  subtitle = 'Point your camera at the barcode',
  showManualInput = true,
  barcodeTypes = ['qr', 'code128', 'code39', 'ean13'],
}) => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [scanSuccess, setScanSuccess] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [lastScannedValue, setLastScannedValue] = useState('');
  const [isUsingZoomSlider, setIsUsingZoomSlider] = useState(false);
  const [zoomTrackWidth, setZoomTrackWidth] = useState(0);
  const cameraRef = useRef(null);
  const baseZoom = useRef(0);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const cornerAnim = useRef(new Animated.Value(0)).current;
  // Removed torchAnim to avoid mixing native/JS drivers; use static color instead

  const { width, height } = useWindowDimensions();
  const scannerFrameSize = Math.min(width, height) * 0.7;

  // Debug permission logging
  useEffect(() => {
    console.log('Camera Permission Status:', hasPermission);
    if (!hasPermission?.granted && isVisible) {
      requestPermission();
    }
  }, [hasPermission, isVisible]);

  // Animation for scanning line (use native driver for translateY)
  useEffect(() => {
    if (isVisible && !scanSuccess) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true, // Changed to true for better performance
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true, // Consistent native driver
          }),
        ])
      ).start();
    }
  }, [isVisible, scanSuccess]);

  // Animation for corner glow effect (use native driver for opacity)
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cornerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true, // Changed to true for better performance
        }),
        Animated.timing(cornerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true, // Consistent native driver
        }),
      ])
    ).start();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanSuccess(true);
    setLastScannedValue(String(data));
    const handler = onBarcodeScanned ?? onScan;
    if (typeof handler === 'function') {
      handler(data);
    } else {
      console.warn(
        '[BarcodeScannerPremium] No handler provided for scanned barcode. Pass `onBarcodeScanned` or `onScan` prop.'
      );
    }

    // Reset after animation
    setTimeout(() => {
      setScanSuccess(false);
    }, 1500);
  };

  const applyZoom = (value) => {
    const nextZoom = clamp(value, MIN_ZOOM, MAX_ZOOM);
    baseZoom.current = nextZoom;
    setZoom(roundZoom(nextZoom));
  };

  const handleZoomChange = (delta) => {
    setZoom((current) => {
      const nextZoom = clamp(current + delta, MIN_ZOOM, MAX_ZOOM);
      baseZoom.current = nextZoom;
      return roundZoom(nextZoom);
    });
  };

  const onPinchGestureEvent = ({ nativeEvent }) => {
    if (!nativeEvent || typeof nativeEvent.scale !== 'number') return;
    const newZoom = clamp(baseZoom.current * nativeEvent.scale, MIN_ZOOM, MAX_ZOOM);
    setZoom(roundZoom(newZoom));
  };

  const onPinchHandlerStateChange = ({ nativeEvent }) => {
    if (!nativeEvent) {
      return;
    }

    if (nativeEvent.state === State.BEGAN) {
      baseZoom.current = zoom || MIN_ZOOM;
      setIsUsingZoomSlider(false);
    }

    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED ||
      nativeEvent.state === State.FAILED
    ) {
      const finalZoom = clamp(baseZoom.current * (nativeEvent.scale || 1), MIN_ZOOM, MAX_ZOOM);
      baseZoom.current = finalZoom;
      setZoom(roundZoom(finalZoom));
    }
  };

  const handleZoomTrackLayout = (event) => {
    setZoomTrackWidth(event.nativeEvent.layout.width);
  };

  const updateZoomFromTrackPosition = (locationX) => {
    if (zoomTrackWidth <= 0) return;
    const ratio = clamp(locationX / zoomTrackWidth, 0, 1);
    const newZoom = MIN_ZOOM + ratio * (MAX_ZOOM - MIN_ZOOM);
    applyZoom(newZoom);
  };

  const onZoomTrackStart = (event) => {
    setIsUsingZoomSlider(true);
    updateZoomFromTrackPosition(event.nativeEvent.locationX);
  };

  const onZoomTrackMove = (event) => {
    if (!isUsingZoomSlider) return;
    updateZoomFromTrackPosition(event.nativeEvent.locationX);
  };

  const onZoomTrackEnd = (event) => {
    if (isUsingZoomSlider) {
      updateZoomFromTrackPosition(event.nativeEvent.locationX);
    }
    setIsUsingZoomSlider(false);
  };

  const handleManualInput = () => {
    if (manualInput.trim()) {
      onBarcodeScanned(manualInput);
      setManualInput('');
      setShowManual(false);
    }
  };

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-scannerFrameSize / 2, scannerFrameSize / 2],
  });

  const cornerOpacity = cornerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  // Static color based on torch state (no animation to avoid driver conflicts)
  const torchBackgroundColor = torchOn ? colors.warning : colors.neutral400;

  if (!hasPermission) {
    return (
      <Modal visible={isVisible} transparent animationType="fade">
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionView}>
            <Ionicons name="alert-circle" size={64} color={colors.error} />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need camera access to scan barcodes.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.permissionButton, styles.permissionButtonSecondary]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.permissionButtonText,
                  styles.permissionButtonTextSecondary,
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <>
      {/* Scanner Modal */}
      <Modal visible={isVisible && !showManual} transparent animationType="slide">
        <GestureHandlerRootView style={styles.cameraWrapper}>
          <PinchGestureHandler
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
          >
            <View style={styles.flex}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                enableTorch={torchOn}
                zoom={zoom}
                onBarcodeScanned={handleBarCodeScanned}
                {...(barcodeTypes
                  ? {
                      barcodeScannerSettings: {
                        barcodeTypes: sanitizeBarcodeTypes(barcodeTypes),
                      },
                    }
                  : {
                      barcodeScannerSettings: {
                        barcodeTypes: ['all'],
                      },
                    })}
              >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.surface} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity
              style={[styles.torchButton, { backgroundColor: torchBackgroundColor }]}
              onPress={() => setTorchOn(!torchOn)}
            >
              <Ionicons
                name={torchOn ? 'flashlight' : 'flashlight-outline'}
                size={24}
                color={colors.surface}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.statusBanner}>
            <Ionicons name="scan-outline" size={20} color={colors.surface} />
            <Text style={styles.statusBannerText}>
              Align the barcode inside the frame and hold steady.
            </Text>
          </View>

          {/* Scanning Area */}
          <View style={styles.scanAreaContainer}>
            {/* Semi-transparent overlay - Reduced opacity for better visibility */}
            <View
              style={[
                styles.overlay,
                {
                  width: width,
                  height: (height - scannerFrameSize) / 2,
                },
              ]}
            />

            {/* Scanner Frame */}
            <View
              style={[
                styles.scannerFrame,
                {
                  width: scannerFrameSize,
                  height: scannerFrameSize,
                  borderColor: scanSuccess ? colors.success : colors.primary,
                },
              ]}
            >
              {/* Corner markers */}
              <ScannerCorner position="top-left" opacity={cornerOpacity} />
              <ScannerCorner position="top-right" opacity={cornerOpacity} />
              <ScannerCorner position="bottom-left" opacity={cornerOpacity} />
              <ScannerCorner position="bottom-right" opacity={cornerOpacity} />

              {/* Scanning line */}
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineY }],
                  },
                ]}
              />

              {/* Pulsating circle */}
              <View style={styles.pulseContainer}>
                <Animated.View
                  style={[
                    styles.pulseDot,
                    {
                      opacity: cornerOpacity,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Bottom overlay - Reduced opacity for better visibility */}
            <View
              style={[
                styles.overlay,
                {
                  width: width,
                  flex: 1,
                },
              ]}
            />
          </View>

          {/* Success Indicator */}
          {scanSuccess && (
            <Animated.View style={styles.successIndicator}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              <Text style={styles.successText}>Barcode Scanned!</Text>
              {!!lastScannedValue && (
                <Text style={styles.successValue} numberOfLines={1}>
                  {lastScannedValue}
                </Text>
              )}
            </Animated.View>
          )}

          {/* Zoom Controls */}
          <View style={styles.zoomContainer}>
            <View style={styles.zoomLabel}>
              <Ionicons name="search" size={18} color={colors.surface} />
              <Text style={styles.zoomLabelText}>
                Zoom {(1 + ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 4).toFixed(1)}x
              </Text>
            </View>
            <View style={styles.zoomControls}>
              <TouchableOpacity
                style={[styles.zoomButton, zoom <= MIN_ZOOM && styles.zoomButtonDisabled]}
                onPress={() => handleZoomChange(-ZOOM_STEP)}
                disabled={zoom <= MIN_ZOOM}
              >
                <Ionicons name="remove" size={20} color={colors.surface} />
              </TouchableOpacity>
              <View
                style={styles.zoomTrack}
                onLayout={handleZoomTrackLayout}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={onZoomTrackStart}
                onResponderMove={onZoomTrackMove}
                onResponderRelease={onZoomTrackEnd}
                onResponderTerminate={onZoomTrackEnd}
              >
                <View
                  style={[
                    styles.zoomFill,
                    {
                      width: `${Math.max(5, ((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100)}%`,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.zoomThumb,
                    {
                      left: `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%`,
                    },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={[styles.zoomButton, zoom >= MAX_ZOOM && styles.zoomButtonDisabled]}
                onPress={() => handleZoomChange(ZOOM_STEP)}
                disabled={zoom >= MAX_ZOOM}
              >
                <Ionicons name="add" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.footer}>
            <View style={styles.tipsContainer}>
              <Ionicons name="bulb-outline" size={18} color={colors.neutral200} />
              <Text style={styles.tipText}>
                Move closer or increase zoom for smaller barcodes.
              </Text>
            </View>
            {showManualInput && (
              <TouchableOpacity
                style={styles.manualButton}
                onPress={() => setShowManual(true)}
              >
                <Ionicons name="create-outline" size={20} color={colors.primary} />
                <Text style={styles.manualButtonText}>Manual Input</Text>
              </TouchableOpacity>
            )}
          </View>
              </CameraView>
            </View>
          </PinchGestureHandler>
        </GestureHandlerRootView>
      </Modal>

      {/* Manual Input Modal */}
      <Modal
        visible={showManual}
        transparent
        animationType="slide"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.manualInputContainer}>
            <Text style={styles.manualInputTitle}>Enter Barcode Manually</Text>
            <TextInput
              style={styles.manualInputField}
              placeholder="Scan code or enter manually"
              placeholderTextColor={colors.textTertiary}
              value={manualInput}
              onChangeText={setManualInput}
              autoFocus
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={handleManualInput}
            >
              <Text style={styles.manualInputButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.manualInputButtonSecondary}
              onPress={() => {
                setShowManual(false);
                setManualInput('');
              }}
            >
              <Text style={styles.manualInputButtonTextSecondary}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

/**
 * Scanner Corner Marker Component
 */
const ScannerCorner = ({ position, opacity }) => {
  const cornerSize = 30;
  const borderWidth = 3;

  const positionStyles = {
    'top-left': { top: -cornerSize / 2, left: -cornerSize / 2 },
    'top-right': { top: -cornerSize / 2, right: -cornerSize / 2 },
    'bottom-left': { bottom: -cornerSize / 2, left: -cornerSize / 2 },
    'bottom-right': { bottom: -cornerSize / 2, right: -cornerSize / 2 },
  };

  const borderStyles = {
    'top-left': {
      borderTopWidth: borderWidth,
      borderLeftWidth: borderWidth,
    },
    'top-right': {
      borderTopWidth: borderWidth,
      borderRightWidth: borderWidth,
    },
    'bottom-left': {
      borderBottomWidth: borderWidth,
      borderLeftWidth: borderWidth,
    },
    'bottom-right': {
      borderBottomWidth: borderWidth,
      borderRightWidth: borderWidth,
    },
  };

  return (
    <Animated.View
      style={[
        styles.corner,
        {
          width: cornerSize,
          height: cornerSize,
          ...positionStyles[position],
          ...borderStyles[position],
          opacity,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral900,
  },
  cameraWrapper: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  camera: {
    flex: 1,
    backgroundColor: 'transparent', // Explicitly set to ensure preview visibility
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  statusBannerText: {
    marginLeft: spacing.sm,
    color: colors.surface,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.surface,
    fontSize: typography.headlineSmall.fontSize,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.neutral200,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '400',
    marginTop: spacing.xs,
  },
  torchButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)', // Reduced opacity from 0.7 to 0.5 for better camera visibility
  },
  scannerFrame: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    borderColor: colors.primary,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: `${colors.success}99`,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  pulseContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  successIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -48 }, { translateY: -48 }],
    alignItems: 'center',
  },
  successText: {
    color: colors.success,
    fontSize: typography.titleMedium.fontSize,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  successValue: {
    marginTop: spacing.xs,
    color: colors.surface,
    fontSize: typography.bodySmall.fontSize,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
    maxWidth: 240,
  },
  zoomContainer: {
    position: 'absolute',
    bottom: spacing.xxxl,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
  },
  zoomLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  zoomLabelText: {
    marginLeft: spacing.xs,
    color: colors.surface,
    fontSize: typography.bodySmall.fontSize,
    fontWeight: '600',
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  zoomButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  zoomButtonDisabled: {
    opacity: 0.4,
  },
  zoomTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  zoomFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  zoomThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    marginLeft: -9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 3,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.3)',
    gap: spacing.md,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  tipText: {
    marginLeft: spacing.sm,
    color: colors.neutral200,
    fontSize: typography.bodySmall.fontSize,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  manualButtonText: {
    marginLeft: spacing.sm,
    color: colors.primary,
    fontSize: typography.labelLarge.fontSize,
    fontWeight: '600',
  },
  manualInputContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  manualInputTitle: {
    fontSize: typography.headlineMedium.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xl,
  },
  manualInputField: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.bodyLarge.fontSize,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  manualInputButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  manualInputButtonText: {
    color: colors.surface,
    fontSize: typography.labelLarge.fontSize,
    fontWeight: '700',
  },
  manualInputButtonSecondary: {
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  manualInputButtonTextSecondary: {
    color: colors.text,
    fontSize: typography.labelLarge.fontSize,
    fontWeight: '700',
  },
  permissionView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  permissionTitle: {
    fontSize: typography.headlineMedium.fontSize,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: typography.bodyMedium.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  permissionButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  permissionButtonText: {
    color: colors.surface,
    fontSize: typography.labelLarge.fontSize,
    fontWeight: '700',
  },
  permissionButtonTextSecondary: {
    color: colors.text,
  },
});

export default BarcodeScannerPremium;