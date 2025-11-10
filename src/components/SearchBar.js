import { Barcode, Search } from 'lucide-react-native';
import {
    ActivityIndicator,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { enhancedTheme } from '../theme/enhancedTheme';

const SearchBar = ({
  value,
  onChangeText,
  onSearch,
  onBarcodeScan,
  loading = false,
  placeholder = 'Search customer name or phone',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Search
          size={20}
          color={enhancedTheme.colors.neutral500}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={enhancedTheme.colors.neutral400}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          editable={!loading}
        />
        {loading && <ActivityIndicator size="small" color={enhancedTheme.colors.primary} />}
      </View>
      <TouchableOpacity
        style={styles.barcodeButton}
        onPress={onBarcodeScan}
        disabled={loading}
      >
        <Barcode size={24} color={enhancedTheme.colors.surface} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.sm,
    gap: enhancedTheme.spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: enhancedTheme.colors.surface,
    borderRadius: enhancedTheme.borderRadius.md,
    paddingHorizontal: enhancedTheme.spacing.md,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
  },
  searchIcon: {
    marginRight: enhancedTheme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: enhancedTheme.spacing.md,
    fontSize: 16,
    color: enhancedTheme.colors.neutral900,
  },
  barcodeButton: {
    backgroundColor: enhancedTheme.colors.primary,
    padding: enhancedTheme.spacing.md,
    borderRadius: enhancedTheme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;

