import { ChevronRight, Mail } from 'lucide-react-native';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { enhancedTheme } from '../theme/enhancedTheme';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

const CustomerCard = ({ customer, onPress, onMessage }) => {
  const initials = customer.customerName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'C';

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        {
          shadowColor: enhancedTheme.colors.neutral900,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        }
      ]} 
      onPress={onPress}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{customer.customerName}</Text>
        <Text style={styles.phone}>
          {formatPhoneNumber(customer.phoneNumber)}
        </Text>
        {customer.address && (
          <Text style={styles.address} numberOfLines={1}>
            {customer.address}
          </Text>
        )}
      </View>

      {/* Right Section - Balance & Actions */}
      <View style={styles.rightContent}>
        {customer.balance !== undefined && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text
              style={[
                styles.balance,
                {
                  color: customer.balance > 0 ? enhancedTheme.colors.success : enhancedTheme.colors.error,
                },
              ]}
            >
              {formatCurrency(customer.balance)}
            </Text>
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {onMessage && (
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={() => onMessage(customer)}
            >
              <Mail
                size={20}
                color={enhancedTheme.colors.primary}
              />
            </TouchableOpacity>
          )}
          <View style={styles.chevronContainer}>
            <ChevronRight
              size={20}
              color={enhancedTheme.colors.primary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: enhancedTheme.colors.surface,
    borderRadius: enhancedTheme.borderRadius.lg,
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.md,
    marginHorizontal: 0,
    marginVertical: 0,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
  },
  avatarContainer: {
    marginRight: enhancedTheme.spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: enhancedTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: enhancedTheme.colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
    marginBottom: enhancedTheme.spacing.xs,
  },
  phone: {
    fontSize: 14,
    color: enhancedTheme.colors.neutral600,
    marginBottom: enhancedTheme.spacing.xs,
  },
  address: {
    fontSize: 14,
    color: enhancedTheme.colors.neutral500,
  },
  rightContent: {
    alignItems: 'flex-end',
    marginLeft: enhancedTheme.spacing.md,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginBottom: enhancedTheme.spacing.sm,
  },
  balanceLabel: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral600,
    marginBottom: 2,
    fontWeight: '600',
  },
  balance: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: enhancedTheme.spacing.xs,
  },
  messageButton: {
    padding: enhancedTheme.spacing.xs,
  },
  chevronContainer: {
    padding: enhancedTheme.spacing.xs,
  },
});

export default CustomerCard;

