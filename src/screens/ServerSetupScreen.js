import AsyncStorage from '@react-native-async-storage/async-storage';
import { Server } from 'lucide-react-native';
import { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import ModernButton from '../components/ui/ModernButton';
import ModernCard from '../components/ui/ModernCard';
import ModernInput from '../components/ui/ModernInput';
import { modernTheme, shadows, spacing, typography } from '../theme/modernTheme';
import { toastError, toastSuccess } from '../utils/toastManager';

const ServerSetupScreen = ({ onSetupComplete }) => {
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('3001');
  const [apiPath, setApiPath] = useState('/api');
  const [loading, setLoading] = useState(false);

  const validateIP = (ip) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^localhost$/;
    return ipRegex.test(ip);
  };

  const validatePort = (port) => {
    const portNum = parseInt(port, 10);
    return portNum >= 1 && portNum <= 65535;
  };

  const handleSaveServer = async () => {
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

      // Save to AsyncStorage
      await AsyncStorage.setItem('SERVER_IP', ipAddress);
      await AsyncStorage.setItem('SERVER_PORT', port);
      await AsyncStorage.setItem('SERVER_API_PATH', normalizedPath);
      await AsyncStorage.setItem('SERVER_URL', serverUrl);
      await AsyncStorage.setItem('SERVER_SETUP_COMPLETE', 'true');

      toastSuccess(`Server configured: ${serverUrl}`);
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
        <View style={[styles.header, shadows.medium]}>
          <Server size={40} color={modernTheme.primary} style={{ marginBottom: spacing.md }} />
          <Text style={styles.title}>Server Configuration</Text>
          <Text style={styles.subtitle}>
            Configure your API server connection
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <ModernInput
            label="Server IP Address"
            placeholder="e.g., 192.168.1.100 or localhost"
            value={ipAddress}
            onChangeText={setIpAddress}
            disabled={loading}
            keyboardType="default"
          />

          <ModernInput
            label="Port Number"
            placeholder="e.g., 3001"
            value={port}
            onChangeText={setPort}
            disabled={loading}
            keyboardType="number-pad"
          />

          <ModernInput
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

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <ModernButton
            text={loading ? "Saving Configuration..." : "Save Configuration"}
            onPress={handleSaveServer}
            disabled={loading}
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
    backgroundColor: modernTheme.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  header: {
    backgroundColor: modernTheme.primary,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.headlineLarge,
    color: modernTheme.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  infoContent: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  infoItem: {
    ...typography.bodySmall,
    color: modernTheme.text,
    fontWeight: '500',
    lineHeight: 20,
  },
});

export default ServerSetupScreen;