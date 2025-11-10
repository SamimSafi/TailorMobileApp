import { useFocusEffect } from '@react-navigation/native';
import { Globe, Plus, Search, Zap } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddCustomerModal from '../components/AddCustomerModal';
import CustomerCardEnhanced from '../components/CustomerCardEnhanced';
import SendMessageModal from '../components/SendMessageModal';
import FloatingActionButton from '../components/navigation/FloatingActionButton';
import BarcodeScannerPremium from '../components/scanner/BarcodeScannerPremium';
import ModernButtonEnhanced from '../components/ui/ModernButtonEnhanced';
import ModernEmptyState from '../components/ui/ModernEmptyState';
import ModernLoading from '../components/ui/ModernLoading';
import ModernSearchBar from '../components/ui/ModernSearchBar';
import { useLanguage } from '../hooks/useLanguage';
import { useResponsive } from '../hooks/useResponsive';
import { useCustomerStore } from '../store/customerStore';
import { useSearchStore } from '../store/searchStore';
import { enhancedTheme } from '../theme/enhancedTheme';
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
  
  // Localization
  const { t } = useLanguage();
  
  // Responsive
  const { isSmallPhone: isSmallDevice } = useResponsive();

  useFocusEffect(
    useCallback(() => {
      searchStore.clearSearch();
    }, [])
  );

  const handleSearch = async () => {
    if (!validateSearchTerm(searchStore.searchTerm)) {
      toastError(t('search.invalidInput'), t('common.error'));
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
    toastInfo(t('search.foundFromBarcode'));
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
      console.log("Navigation done");
      
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
      <CustomerCardEnhanced
        customer={item}
        onPress={() => handleSelectCustomer(item)}
        onMessage={handleMessageCustomer}
        onCall={() => {
          toastInfo(`Call: ${item.phoneNumber || 'N/A'}`);
        }}
      />
    </View>
  );

  const renderEmptyState = () => {
    if (searchStore.loading) {
      return (
        <ModernLoading
          visible={true}
          message={t('search.loadingResults')}
          color={enhancedTheme.colors.primary}
        />
      );
    }

    if (searchStore.error) {
      return (
        <ModernEmptyState
          icon={<Search color={enhancedTheme.colors.error} />}
          title={t('common.error')}
          description={searchStore.error}
          actionText={t('actions.retry')}
          onActionPress={() => searchStore.clearSearch()}
        />
      );
    }

    if (searchStore.searchResults.length === 0 && searchStore.searchTerm) {
      return (
        <ModernEmptyState
          icon={<Search color={enhancedTheme.colors.primary} />}
          title={t('search.noResults')}
          description={`${t('search.noResults')}. ${t('search.addNewCustomer')}?`}
          actionText={t('search.addNewCustomer')}
          onActionPress={() => setAddCustomerModalVisible(true)}
        />
      );
    }

    return (
      <ModernEmptyState
        icon={<Search color={enhancedTheme.colors.neutral400} />}
        title={t('search.title')}
        description={t('search.searchPlaceholder')}
        actionButton={
          <ModernButtonEnhanced
            title={t('search.addNewCustomer')}
            onPress={() => setAddCustomerModalVisible(true)}
            variant="primary"
            size="lg"
            icon={Plus}
            fullWidth
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: enhancedTheme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: enhancedTheme.colors.primary, ...enhancedTheme.shadows.lg }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitle}>
            <Zap size={24} color="#ffffff" />
            <View style={{ marginLeft: enhancedTheme.spacing.md }}>
              <Text style={[styles.headerText, { color: '#ffffff' }]}>ماستر خیاط</Text>
              <Text style={[styles.headerSubtext, { color: 'rgba(255, 255, 255, 0.8)' }]}>{t('search.title')}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('LanguageSelection')}
          style={styles.languageButton}
          activeOpacity={0.7}
        >
          <Globe size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingHorizontal: enhancedTheme.spacing.lg, paddingVertical: enhancedTheme.spacing.lg }]}>
        <ModernSearchBar
          value={searchStore.searchTerm}
          onChangeText={(text) => searchStore.setSearchTerm(text)}
          onSearch={handleSearch}
          onScanPress={() => setScannerVisible(true)}
          loading={searchStore.loading}
          placeholder={t('search.searchPlaceholder')}
          style={styles.searchBar}
        />
      </View>

      {/* Results or Empty State */}
      {searchStore.searchResults.length > 0 ? (
        <FlatList
          data={searchStore.searchResults}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || item._id || item.customerId || `customer-${index}`}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: enhancedTheme.spacing.md, paddingVertical: enhancedTheme.spacing.md }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.resultsInfo, { paddingBottom: enhancedTheme.spacing.md, borderBottomWidth: 1, borderBottomColor: enhancedTheme.colors.neutral200 }]}>
              <Text style={[styles.resultCount, { color: enhancedTheme.colors.neutral600 }]}>
                {t('common.search')}: {searchStore.searchResults.length}
              </Text>
            </View>
          }
        />
      ) : (
        renderEmptyState()
      )}

      {/* Modals */}
      <BarcodeScannerPremium
        isVisible={scannerVisible}
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

      {/* Floating Action Button */}
      <FloatingActionButton
        onPress={() => setAddCustomerModalVisible(true)}
        icon={Plus}
        position="bottom-right"
        size="large"
        variant="primary"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: enhancedTheme.spacing.lg,
    paddingVertical: enhancedTheme.spacing.lg,
    borderBottomLeftRadius: enhancedTheme.borderRadius.lg,
    borderBottomRightRadius: enhancedTheme.borderRadius.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    marginLeft: enhancedTheme.spacing.md,
    padding: enhancedTheme.spacing.sm,
  },
  headerText: {
    fontSize: enhancedTheme.typography.headlineSmall.fontSize,
    fontWeight: '700',
  },
  headerSubtext: {
    fontSize: enhancedTheme.typography.bodySmall.fontSize,
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: '#ffffff',
  },
  searchBar: {
    marginHorizontal: 0,
  },
  listContent: {
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: enhancedTheme.spacing.md,
  },
  resultsInfo: {
    marginBottom: enhancedTheme.spacing.md,
  },
  resultCount: {
    fontSize: enhancedTheme.typography.bodySmall.fontSize,
    fontWeight: '600',
  },
});

export default SearchScreenModern;