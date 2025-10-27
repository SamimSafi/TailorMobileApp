import { ChevronRight, Mail } from 'lucide-react-native';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { modernTheme, shadows, spacing, typography } from '../theme/modernTheme';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

const CustomerCard = ({ customer, onPress, onMessage }) => {
  const initials = customer.customerName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'C';

  return (
    <TouchableOpacity style={[styles.container, shadows.small]} onPress={onPress}>
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
                  color: customer.balance > 0 ? modernTheme.success : modernTheme.error,
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
                color={modernTheme.primary}
              />
            </TouchableOpacity>
          )}
          <View style={styles.chevronContainer}>
            <ChevronRight
              size={20}
              color={modernTheme.primary}
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
    backgroundColor: modernTheme.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginHorizontal: 0,
    marginVertical: 0,
    borderWidth: 1,
    borderColor: modernTheme.divider,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: modernTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: modernTheme.white,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  name: {
    ...typography.bodyLarge,
    color: modernTheme.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  phone: {
    ...typography.bodySmall,
    color: modernTheme.textSecondary,
    marginBottom: spacing.xs,
  },
  address: {
    ...typography.bodySmall,
    color: modernTheme.textTertiary,
  },
  rightContent: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    ...typography.labelSmall,
    color: modernTheme.textSecondary,
    marginBottom: 2,
    fontWeight: '600',
  },
  balance: {
    ...typography.labelLarge,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  messageButton: {
    padding: spacing.xs,
  },
  chevronContainer: {
    padding: spacing.xs,
  },
});

export default CustomerCard;

