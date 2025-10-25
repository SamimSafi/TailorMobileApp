import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../theme/colors';

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
      Alert.alert('Error', 'Please enter a server IP address or hostname');
      return;
    }

    if (!port.trim()) {
      Alert.alert('Error', 'Please enter a port number');
      return;
    }

    if (!validateIP(ipAddress)) {
      Alert.alert('Error', 'Please enter a valid IP address (e.g., 192.168.1.100) or localhost');
      return;
    }

    if (!validatePort(port)) {
      Alert.alert('Error', 'Please enter a valid port number (1-65535)');
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

      Alert.alert(
        'Success',
        `Server configured successfully!\n\nServer: ${serverUrl}`,
        [{ text: 'OK', onPress: onSetupComplete }]
      );
    } catch (error) {
      console.error('Error saving server configuration:', error);
      Alert.alert('Error', 'Failed to save server configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Server Configuration</Text>
          <Text style={styles.subtitle}>
            Enter your API server details. This will be saved and used for all requests.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Server IP Address or Hostname</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 192.168.1.100 or localhost"
              placeholderTextColor="#999"
              value={ipAddress}
              onChangeText={setIpAddress}
              editable={!loading}
              keyboardType="default"
            />
            <Text style={styles.helperText}>
              For emulator: use your machine's local IP (find with ipconfig)
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Port Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 3001"
              placeholderTextColor="#999"
              value={port}
              onChangeText={setPort}
              editable={!loading}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>API Path</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., /api or /v1/api"
              placeholderTextColor="#999"
              value={apiPath}
              onChangeText={setApiPath}
              editable={!loading}
              keyboardType="default"
            />
            <Text style={styles.helperText}>
              The path appended after port (e.g., /api, /v1, /backend)
            </Text>
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Complete API URL:</Text>
            <Text style={styles.previewValue}>
              {ipAddress && port ? `http://${ipAddress}:${port}${apiPath}` : 'Not configured'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSaveServer}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Server Configuration</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ Info</Text>
          <Text style={styles.infoText}>
            • This configuration will persist until you uninstall the app
          </Text>
          <Text style={styles.infoText}>
            • You can change it later from the app settings (if available)
          </Text>
          <Text style={styles.infoText}>
            • Make sure your server is running and accessible
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border || '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.inputBackground || '#f8f8f8',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  previewContainer: {
    backgroundColor: colors.inputBackground || '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoContainer: {
    backgroundColor: colors.inputBackground || '#f8f8f8',
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default ServerSetupScreen;