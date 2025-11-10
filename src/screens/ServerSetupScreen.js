import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Server, Upload } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModernButtonEnhanced from '../components/ui/ModernButtonEnhanced';
import ModernCard from '../components/ui/ModernCard';
import ModernInputEnhanced from '../components/ui/ModernInputEnhanced';
import { updateApiBaseUrl } from '../services/api';
import { ensureBusinessInfoInitialized, saveBusinessInfo } from '../services/businessInfoService';
import enhancedTheme from '../theme/enhancedTheme';
import { toastError, toastSuccess } from '../utils/toastManager';

const ServerSetupScreen = ({ onSetupComplete }) => {
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('3001');
  const [apiPath, setApiPath] = useState('/api');
  const [loading, setLoading] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsApp, setWhatsApp] = useState('');
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    let mounted = true;
    ensureBusinessInfoInitialized()
      .then((info) => {
        if (!mounted || !info) return;
        setShopName(info.shopNameFull || '');
        setOwnerName(info.ownerName || '');
        setContactNumber(info.phoneNumbers?.[0] || '');
        setWhatsApp(info.whatsapp || '');
        setLogoPreview(info.logos?.primary || '');
      })
      .catch((error) => {
        console.warn('[ServerSetupScreen] Failed to load business info', error);
      })
      .finally(() => {
        if (mounted) {
          setBusinessLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const validateIP = (ip) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^localhost$/;
    return ipRegex.test(ip);
  };

  const validatePort = (port) => {
    const portNum = parseInt(port, 10);
    return portNum >= 1 && portNum <= 65535;
  };

  const handleImagePick = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toastError('Permission to access media library is required');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64Data = `data:image/jpeg;base64,${asset.base64}`;
        setLogoPreview(base64Data);
        toastSuccess('Logo updated successfully');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      toastError('Failed to select image');
    }
  };

  const handleSaveServer = async () => {
    if (businessLoading) {
      toastError('Business settings are still loading. Please wait.');
      return;
    }

    if (!shopName.trim()) {
      toastError('Please provide your shop name for receipts.');
      return;
    }

    // Validate inputs
    if (!ipAddress.trim()) {
      toastError('Please enter a server IP address or hostname');
      return;
    }

    if (!port.trim()) {
      toastError('Please enter a port number');
      return;
    }

    if (!validateIP(ipAddress)) {
      toastError('Please enter a valid IP address (e.g., 192.168.1.100) or localhost');
      return;
    }

    if (!validatePort(port)) {
      toastError('Please enter a valid port number (1-65535)');
      return;
    }

    setLoading(true);

    try {
      // Construct the full API URL with custom API path
      const normalizedPath = apiPath.startsWith('/') ? apiPath : '/' + apiPath;
      const serverUrl = `http://${ipAddress}:${port}${normalizedPath}`;

      // Update API client immediately to prevent undefined baseURL usage
      updateApiBaseUrl(serverUrl);

      // Save to AsyncStorage
      await AsyncStorage.multiSet([
        ['SERVER_IP', ipAddress],
        ['SERVER_PORT', port],
        ['SERVER_API_PATH', normalizedPath],
        ['SERVER_URL', serverUrl],
        ['SERVER_SETUP_COMPLETE', 'true'],
      ]);

      toastSuccess(`Server configured: ${serverUrl}`);

      await saveBusinessInfo({
        shopNameFull: shopName,
        ownerName,
        phoneNumbers: contactNumber ? [contactNumber] : [],
        whatsapp: whatsApp,
        logos: {
          primary: logoPreview,
        },
      });

      toastSuccess('Business profile saved');
      setTimeout(onSetupComplete, 500);
    } catch (error) {
      console.error('Error saving server configuration:', error);
      toastError('Failed to save server configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: enhancedTheme.colors.primary, shadowColor: enhancedTheme.shadows.md.shadowColor }]}>
          <Server size={40} color={enhancedTheme.colors.surface} style={{ marginBottom: enhancedTheme.spacing.md }} />
          <Text style={styles.title}>Server Configuration</Text>
          <Text style={styles.subtitle}>
            Configure your API server connection
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <ModernInputEnhanced
            label="Server IP Address"
            placeholder="e.g., 192.168.1.100 or localhost"
            value={ipAddress}
            onChangeText={setIpAddress}
            disabled={loading}
            keyboardType="default"
          />

          <ModernInputEnhanced
            label="Port Number"
            placeholder="e.g., 3001"
            value={port}
            onChangeText={setPort}
            disabled={loading}
            keyboardType="number-pad"
          />

          <ModernInputEnhanced
            label="API Path"
            placeholder="e.g., /api"
            value={apiPath}
            onChangeText={setApiPath}
            disabled={loading}
            keyboardType="default"
          />

          {/* Preview Card */}
          {ipAddress && port && (
            <ModernCard
              title="API URL Preview"
              description={`http://${ipAddress}:${port}${apiPath}`}
              variant="outlined"
            />
          )}
        </View>

        <ModernCard
          title="Business Profile"
          description="Details shown on receipts and customer communications."
          variant="elevated"
        >
          <View style={styles.businessSection}>
            <View style={styles.logoBlock}>
              {logoPreview ? (
                <Image source={{ uri: logoPreview }} style={styles.logoImage} resizeMode="contain" />
              ) : (
                <View style={[styles.logoImage, styles.logoPlaceholder]}>
                  <Text style={styles.logoPlaceholderText}>Logo</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleImagePick}
                disabled={loading || businessLoading}
              >
                <Upload size={16} color={enhancedTheme.colors.primary} />
                <Text style={styles.uploadButtonText}>
                 {logoPreview ? 'Change Logo' : 'Upload Logo'}
               </Text>
              </TouchableOpacity>
              <Text style={styles.logoHint}>
                Upload a custom logo for receipts. Recommended: Square image, max 1MB.
              </Text>
            </View>

            <ModernInputEnhanced
              label="Shop Name"
              placeholder="Business name displayed on receipts"
              value={shopName}
              onChangeText={setShopName}
              disabled={loading || businessLoading}
            />

            <ModernInputEnhanced
              label="Owner Name"
              placeholder="Name shown beneath the logo"
              value={ownerName}
              onChangeText={setOwnerName}
              disabled={loading || businessLoading}
            />

            <ModernInputEnhanced
              label="Primary Phone"
              placeholder="e.g., 0700 000 000"
              value={contactNumber}
              onChangeText={setContactNumber}
              disabled={loading || businessLoading}
              keyboardType="phone-pad"
            />

            <ModernInputEnhanced
              label="WhatsApp"
              placeholder="WhatsApp contact number"
              value={whatsApp}
              onChangeText={setWhatsApp}
              disabled={loading || businessLoading}
              keyboardType="phone-pad"
            />
          </View>
        </ModernCard>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <ModernButtonEnhanced
            title={loading ? "Saving Configuration..." : "Save Configuration"}
            onPress={handleSaveServer}
            disabled={loading || businessLoading}
            loading={loading}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>

        {/* Info Card */}
        <ModernCard
          title="📋 Important Information"
          description="Your configuration will be saved and used for all API requests. Ensure your server is accessible."
          variant="elevated"
        >
          <View style={styles.infoContent}>
            <Text style={styles.infoItem}>✓ Configuration persists until app reinstall</Text>
            <Text style={styles.infoItem}>✓ Server must be running and accessible</Text>
            <Text style={styles.infoItem}>✓ Common ports: 3000, 3001, 5000, 8000, 8080</Text>
          </View>
        </ModernCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: enhancedTheme.colors.neutral50,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.lg,
  },
  header: {
    borderRadius: enhancedTheme.borderRadius.lg,
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.xl,
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: enhancedTheme.shadows.md.elevation,
  },
  title: {
    fontSize: enhancedTheme.typography.headlineLarge.fontSize,
    fontWeight: enhancedTheme.typography.headlineLarge.fontWeight,
    color: enhancedTheme.colors.surface,
    marginBottom: enhancedTheme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: enhancedTheme.typography.bodyMedium.fontSize,
    fontWeight: enhancedTheme.typography.bodyMedium.fontWeight,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: enhancedTheme.spacing.xl,
    gap: enhancedTheme.spacing.lg,
  },
  businessSection: {
    gap: enhancedTheme.spacing.lg,
  },
  logoBlock: {
    alignItems: 'center',
    gap: enhancedTheme.spacing.md,
  },
  logoImage: {
    width: 140,
    height: 90,
    borderRadius: enhancedTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
    backgroundColor: enhancedTheme.colors.surface,
  },
  logoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: enhancedTheme.typography.bodyMedium.fontSize,
    fontWeight: '700',
    color: enhancedTheme.colors.neutral400,
  },
  logoHint: {
    textAlign: 'center',
    fontSize: enhancedTheme.typography.bodySmall.fontSize,
    color: enhancedTheme.colors.neutral600,
    paddingHorizontal: enhancedTheme.spacing.xl,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: enhancedTheme.colors.neutral100,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.primary,
    borderRadius: enhancedTheme.borderRadius.md,
    paddingVertical: enhancedTheme.spacing.sm,
    paddingHorizontal: enhancedTheme.spacing.md,
  },
  uploadButtonText: {
    fontSize: enhancedTheme.typography.bodyMedium.fontSize,
    color: enhancedTheme.colors.primary,
    fontWeight: '600',
    marginLeft: enhancedTheme.spacing.xs,
  },
  buttonContainer: {
    marginBottom: enhancedTheme.spacing.xl,
  },
  infoContent: {
    marginTop: enhancedTheme.spacing.md,
    gap: enhancedTheme.spacing.md,
  },
  infoItem: {
    fontSize: enhancedTheme.typography.bodySmall.fontSize,
    fontWeight: enhancedTheme.typography.bodySmall.fontWeight,
    color: enhancedTheme.colors.neutral700,
    lineHeight: 20,
  },
});

export default ServerSetupScreen;