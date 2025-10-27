import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddCustomerModal from '../components/AddCustomerModal';
import BarcodeScanner from '../components/BarcodeScanner';
import CustomerCard from '../components/CustomerCard';
import SearchBar from '../components/SearchBar';
import SendMessageModal from '../components/SendMessageModal';
import { useCustomerStore } from '../store/customerStore';
import { useSearchStore } from '../store/searchStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { storage } from '../utils/storage';
import { validateSearchTerm } from '../utils/validators';

const SearchScreen = ({ navigation }) => {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedCustomerForMessage, setSelectedCustomerForMessage] = useState(null);
  const [addCustomerModalVisible, setAddCustomerModalVisible] = useState(false);
  const searchStore = useSearchStore();
  const customerStore = useCustomerStore();

  useFocusEffect(
    useCallback(() => {
      searchStore.clearSearch();
    }, [])
  );

  const handleSearch = async () => {
    if (!validateSearchTerm(searchStore.searchTerm)) {
      Alert.alert('Invalid Input', 'Please enter a search term');
      return;
    }
    await searchStore.searchCustomer(searchStore.searchTerm);
    await storage.addToSearchHistory({
      id: Date.now().toString(),
      term: searchStore.searchTerm,
      timestamp: new Date().toISOString(),
    });
  };

  const handleBarcodeScan = async (data) => {
    setScannerVisible(false);
    // Treat barcode data as customer ID or search term
    searchStore.setSearchTerm(data);
    await searchStore.searchCustomer(data);
  };

  const handleSelectCustomer = async (customer) => {
    try {
      const customerId = customer.id || customer._id || customer.customerId;
      if (!customerId) {
        Alert.alert('Error', 'Customer ID not found');
        return;
      }
      await customerStore.selectCustomer(customerId);
      navigation.navigate('CustomerDetails', { customer });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load customer details');
    }
  };

  const handleMessageCustomer = (customer) => {
    setSelectedCustomerForMessage(customer);
    setMessageModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <CustomerCard
      customer={item}
      onPress={() => handleSelectCustomer(item)}
      onMessage={handleMessageCustomer}
    />
  );

  const renderEmptyList = () => {
    if (searchStore.loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (searchStore.error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{searchStore.error}</Text>
        </View>
      );
    }

    if (searchStore.searchResults.length === 0 && searchStore.searchTerm) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No customers found</Text>
          <TouchableOpacity
            style={styles.addCustomerButton}
            onPress={() => setAddCustomerModalVisible(true)}
          >
            <Ionicons name="add-circle" size={20} color={colors.white} />
            <Text style={styles.addCustomerButtonText}>Add New Customer</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          Search for a customer by name or phone number
        </Text>
        <TouchableOpacity
          style={styles.addCustomerButton}
          onPress={() => setAddCustomerModalVisible(true)}
        >
          <Ionicons name="add-circle" size={20} color={colors.white} />
          <Text style={styles.addCustomerButtonText}>Add New Customer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>XPOSE Tailor</Text>
        <Text style={styles.subtitle}>Search Customers</Text>
      </View>

      <SearchBar
        value={searchStore.searchTerm}
        onChangeText={(text) => searchStore.setSearchTerm(text)}
        onSearch={handleSearch}
        onBarcodeScan={() => setScannerVisible(true)}
        loading={searchStore.loading}
      />

      {searchStore.searchResults.length > 0 ? (
        <FlatList
          data={searchStore.searchResults}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || item._id || item.customerId || `customer-${index}`}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        renderEmptyList()
      )}

      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
      />

      <SendMessageModal
        visible={messageModalVisible}
        onClose={() => {
          setMessageModalVisible(false);
          setSelectedCustomerForMessage(null);
        }}
        customer={selectedCustomerForMessage}
        onMessageSent={() => {
          setMessageModalVisible(false);
          setSelectedCustomerForMessage(null);
          Alert.alert('Success', 'Message sent successfully!');
        }}
      />

      <AddCustomerModal
        visible={addCustomerModalVisible}
        onClose={() => setAddCustomerModalVisible(false)}
        onSuccess={(newCustomer) => {
          // Refresh search or navigate to new customer
          if (newCustomer) {
            Alert.alert('Success', 'Customer added! You can now search for them.');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  addCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  addCustomerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default SearchScreen;

