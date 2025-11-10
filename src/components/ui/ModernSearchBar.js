import { Search, X, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { modernTheme, radius, spacing } from '../../theme/modernTheme';

const ModernSearchBar = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder = 'Search...',
  loading = false,
  onScanPress,
  editable = true,
  style,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isFocused ? modernTheme.primary : modernTheme.border,
          backgroundColor: modernTheme.white,
        },
        style,
      ]}
    >
      <Search size={20} color={modernTheme.textSecondary} style={styles.searchIcon} />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={modernTheme.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={onSearch}
        editable={editable}
        returnKeyType="search"
      />

      {value && !loading && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={modernTheme.textSecondary} />
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="small" color={modernTheme.primary} />
        </View>
      )}

      {/* {onScanPress && !loading && ( */}
        <TouchableOpacity onPress={onScanPress} style={styles.scanButton}>
          <Zap size={20} color={modernTheme.primary} />
        </TouchableOpacity>
      {/* )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    backgroundColor: modernTheme.white,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: modernTheme.text,
    paddingVertical: spacing.md,
  },
  clearButton: {
    marginLeft: spacing.md,
    padding: spacing.sm,
  },
  loadingIcon: {
    marginLeft: spacing.md,
  },
  scanButton: {
    marginLeft: spacing.md,
    padding: spacing.sm,
  },
});

export default ModernSearchBar;