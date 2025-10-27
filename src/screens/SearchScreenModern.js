import { useFocusEffect } from '@react-navigation/native';
import { Plus, Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import AddCustomerModal from '../components/AddCustomerModal';
import BarcodeScanner from '../components/BarcodeScanner';
import CustomerCard from '../components/CustomerCard';
import SendMessageModal from '../components/SendMessageModal';
import ModernButton from '../components/ui/ModernButton';
import ModernEmptyState from '../components/ui/ModernEmptyState';
import ModernLoading from '../components/ui/ModernLoading';
import ModernSearchBar from '../components/ui/ModernSearchBar';
import { useCustomerStore } from '../store/customerStore';
import { useSearchStore } from '../store/searchStore';
import { modernTheme, shadows, spacing, typography } from '../theme/modernTheme';
import { storage } from '../utils/storage';
import { toastError, toastInfo, toastSuccess } from '../utils/toastManager';
import { validateSearchTerm } from '../utils/validators';

const SearchScreenModern = ({ navigation }) => {
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
      toastError('Please enter a search term', 'Invalid Input');
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
    searchStore.setSearchTerm(data);
    await searchStore.searchCustomer(data);
    toastInfo('Customer found from barcode scan');
  };

  const handleSelectCustomer = async (customer) => {
    try {
      const customerId = customer.id || customer._id || customer.customerId;
      if (!customerId) {
        toastError('Customer ID not found');
        return;
      }
      await customerStore.selectCustomer(customerId);
      navigation.navigate('CustomerDetails', { customer });
    } catch (error) {
      toastError(error.message || 'Failed to load customer details');
    }
  };

  const handleMessageCustomer = (customer) => {
    setSelectedCustomerForMessage(customer);
    setMessageModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <CustomerCard
        customer={item}
        onPress={() => handleSelectCustomer(item)}
        onMessage={handleMessageCustomer}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (searchStore.loading) {
      return (
        <ModernLoading
          visible={true}
          message="Searching customers..."
          color={modernTheme.primary}
        />
      );
    }

    if (searchStore.error) {
      return (
        <ModernEmptyState
          icon={<Search color={modernTheme.error} />}
          title="Search Error"
          description={searchStore.error}
          actionText="Try Again"
          onActionPress={() => searchStore.clearSearch()}
        />
      );
    }

    if (searchStore.searchResults.length === 0 && searchStore.searchTerm) {
      return (
        <ModernEmptyState
          icon={<Search color={modernTheme.primary} />}
          title="No Customers Found"
          description={`No results matching "${searchStore.searchTerm}". Would you like to add a new customer?`}
          actionText="Add New Customer"
          onActionPress={() => setAddCustomerModalVisible(true)}
        />
      );
    }

    return (
      <ModernEmptyState
        icon={<Search color={modernTheme.textTertiary} />}
        title="Find Your Customer"
        description="Search by customer name or phone number to get started"
        actionButton={
          <ModernButton
            text="Add New Customer"
            onPress={() => setAddCustomerModalVisible(true)}
            variant="primary"
            size="md"
            icon={Plus}
            fullWidth={true}
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, shadows.medium]}>
        <View>
          <View style={styles.headerTitle}>
            <Search size={24} color={modernTheme.white} />
            <View style={{ marginLeft: spacing.md }}>
              <View style={styles.headerText}>XPOSE Tailor</View>
              <View style={styles.headerSubtext}>Manage Your Customers</View>
            </View>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <ModernSearchBar
          value={searchStore.searchTerm}
          onChangeText={(text) => searchStore.setSearchTerm(text)}
          onSearch={handleSearch}
          onScanPress={() => setScannerVisible(true)}
          loading={searchStore.loading}
          placeholder="Search by name or phone..."
          style={styles.searchBar}
        />
      </View>

      {/* Results or Empty State */}
      {searchStore.searchResults.length > 0 ? (
        <FlatList
          data={searchStore.searchResults}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || item._id || item.customerId || `customer-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsInfo}>
              <View style={styles.resultCount}>
                Found {searchStore.searchResults.length} customer{searchStore.searchResults.length !== 1 ? 's' : ''}
              </View>
            </View>
          }
        />
      ) : (
        renderEmptyState()
      )}

      {/* Modals */}
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
          toastSuccess('Message sent successfully!');
        }}
      />

      <AddCustomerModal
        visible={addCustomerModalVisible}
        onClose={() => setAddCustomerModalVisible(false)}
        onSuccess={(newCustomer) => {
          if (newCustomer) {
            toastSuccess('Customer added successfully! Search for them now.');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.background,
  },
  header: {
    backgroundColor: modernTheme.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    ...typography.headlineLarge,
    color: modernTheme.white,
  },
  headerSubtext: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: modernTheme.white,
  },
  searchBar: {
    marginHorizontal: 0,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
  resultsInfo: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.divider,
  },
  resultCount: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
    fontWeight: '600',
  },
});

export default SearchScreenModern;