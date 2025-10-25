import { Ionicons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { formatCurrency, formatPhoneNumber } from '../utils/formatters';

const CustomerCard = ({ customer, onPress, onMessage }) => {
  const initials = customer.customerName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'C';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

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

      <View style={styles.rightContent}>
        {customer.balance !== undefined && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text
              style={[
                styles.balance,
                {
                  color: customer.balance > 0 ? colors.success : colors.error,
                },
              ]}
            >
              {formatCurrency(customer.balance)}
            </Text>
          </View>
        )}
        <View style={styles.actionButtons}>
          {onMessage && (
            <TouchableOpacity 
              style={styles.messageButton}
              onPress={() => onMessage(customer)}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.primary}
            style={styles.chevron}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  phone: {
    fontSize: 14,
    color: colors.darkGray,
    marginBottom: spacing.xs,
  },
  address: {
    fontSize: 12,
    color: colors.darkGray,
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
    fontSize: 12,
    color: colors.darkGray,
    marginBottom: spacing.xs,
  },
  balance: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  chevron: {
    marginTop: spacing.sm,
  },
});

export default CustomerCard;

