/**
 * EXAMPLE: SearchScreen with Localization
 * 
 * This is an example showing how to integrate the localization system
 * into your existing screens. You can use this as a reference to update
 * other screens in the application.
 */

import { useFocusEffect } from '@react-navigation/native';
import { Plus, Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddCustomerModal from '../components/AddCustomerModal';
import BarcodeScanner from '../components/BarcodeScanner';
import CustomerCard from '../components/CustomerCard';
import SendMessageModal from '../components/SendMessageModal';
import ModernButton from '../components/ui/ModernButton';
import ModernEmptyState from '../components/ui/ModernEmptyState';
import ModernLoading from '../components/ui/ModernLoading';
import ModernSearchBar from '../components/ui/ModernSearchBar';
import { useLanguage } from '../hooks/useLanguage';
import { useCustomerStore } from '../store/customerStore';
import { useSearchStore } from '../store/searchStore';
import { shadows, spacing } from '../theme/modernTheme';
import { storage } from '../utils/storage';
import { toastError, toastInfo, toastSuccess } from '../utils/toastManager';
import { validateSearchTerm } from '../utils/validators';

const SearchScreenLocalized = ({ navigation }) => {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedCustomerForMessage, setSelectedCustomerForMessage] = useState(null);
  const [addCustomerModalVisible, setAddCustomerModalVisible] = useState(false);
  
  // Use language hook for translations
  const { t, isRTL } = useLanguage();
  
  const searchStore = useSearchStore();
  const customerStore = useCustomerStore();

  useFocusEffect(
    useCallback(() => {
      searchStore.clearSearch();
    }, [])
  );

  const handleSearch = async () => {
    if (!validateSearchTerm(searchStore.searchTerm)) {
      // Use localized strings
      toastError(t('validation.required'), t('toast.error'));
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
    // Use localized string
    toastInfo(t('search.foundFromBarcode'));
  };

  const handleSelectCustomer = async (customer) => {
    try {
      const customerId = customer.id || customer._id || customer.customerId;
      if (!customerId) {
        // Use localized string
        toastError(t('customer.details'));
        return;
      }
      await customerStore.selectCustomer(customerId);
      navigation.navigate('CustomerDetails', { customer });
    } catch (error) {
      // Use localized string
      toastError(error.message || t('toast.operationFailed'));
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ModernSearchBar
          placeholder={t('search.searchPlaceholder')}
          value={searchStore.searchTerm}
          onChangeText={(text) => searchStore.setSearchTerm(text)}
          onSearch={handleSearch}
          loading={searchStore.loading}
          style={{ marginBottom: spacing.md }}
        />
        <View style={[styles.buttonGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <ModernButton
            title={t('barcode.title')}
            icon={<Search size={18} color="#fff" />}
            onPress={() => setScannerVisible(true)}
            variant="secondary"
            size="sm"
            style={styles.actionButton}
          />
          <ModernButton
            title={t('addCustomer.title')}
            icon={<Plus size={18} color="#fff" />}
            onPress={() => setAddCustomerModalVisible(true)}
            size="sm"
            style={styles.actionButton}
          />
        </View>
      </View>

      {searchStore.loading ? (
        <ModernLoading message={t('search.loadingResults')} />
      ) : searchStore.results && searchStore.results.length > 0 ? (
        <FlatList
          data={searchStore.results}
          renderItem={renderItem}
          keyExtractor={(item) => (item.id || item._id || item.customerId).toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: spacing.lg }} />}
        />
      ) : (
        <ModernEmptyState
          title={t('search.noResults')}
          subtitle={t('search.trySearching')}
          icon="Search"
        />
      )}

      {/* Modals */}
      <BarcodeScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScan}
      />

      <AddCustomerModal
        visible={addCustomerModalVisible}
        onClose={() => setAddCustomerModalVisible(false)}
        onCustomerAdded={() => {
          setAddCustomerModalVisible(false);
          // Use localized string
          toastSuccess(t('addCustomer.customerAdded'));
          searchStore.clearSearch();
        }}
      />

      <SendMessageModal
        visible={messageModalVisible}
        onClose={() => setMessageModalVisible(false)}
        customer={selectedCustomerForMessage}
        onMessageSent={() => {
          setMessageModalVisible(false);
          // Use localized string
          toastSuccess(t('messages.messagesSent'));
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#fff',
    ...shadows.sm,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  cardContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});

export default SearchScreenLocalized;

/**
 * KEY CHANGES FOR LOCALIZATION:
 * 
 * 1. Import useLanguage hook:
 *    import { useLanguage } from '../hooks/useLanguage';
 * 
 * 2. Get translations in component:
 *    const { t, isRTL } = useLanguage();
 * 
 * 3. Replace hard-coded strings with t() calls:
 *    OLD: placeholder="Enter customer name or ID"
 *    NEW: placeholder={t('search.searchPlaceholder')}
 * 
 * 4. Handle RTL layouts:
 *    OLD: flexDirection: 'row'
 *    NEW: flexDirection: isRTL ? 'row-reverse' : 'row'
 * 
 * 5. Update all user-facing strings:
 *    - UI labels
 *    - Placeholder text
 *    - Button labels
 *    - Toast messages
 *    - Error messages
 *    - Empty state messages
 * 
 * MIGRATION STEPS FOR EXISTING SCREENS:
 * 
 * 1. Add import: import { useLanguage } from '../hooks/useLanguage';
 * 2. Add hook: const { t, isRTL } = useLanguage();
 * 3. Replace strings: t('section.key')
 * 4. Update flexDirection: isRTL ? 'row-reverse' : 'row'
 * 5. Test with all three languages
 * 6. Verify RTL layout
 */