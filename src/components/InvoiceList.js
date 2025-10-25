import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { formatCurrency, formatDate } from '../utils/formatters';

const InvoiceList = ({ invoices, onSelectInvoice }) => {
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'partial':
        return colors.warning;
      case 'pending':
      case 'issued':
      default:
        return colors.error;
    }
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      paid: 'Paid',
      partial: 'Partial',
      pending: 'Pending',
      issued: 'Due',
    };
    return labels[status] || status;
  };

  const renderInvoice = ({ item, index }) => {
    const statusColor = getPaymentStatusColor(item.paymentStatus);
    const dueAmount = item.dueAmount || (item.totalAmount - (item.paidAmount || 0));
    const hasDue = dueAmount > 0;

    return (
      <TouchableOpacity
        style={[styles.invoiceCard, hasDue && styles.invoiceCardHighlight]}
        onPress={() => hasDue && onSelectInvoice(item)}
        disabled={!hasDue}
      >
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceNumberSection}>
            <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>{formatDate(item.issueDate)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getPaymentStatusLabel(item.paymentStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.invoiceBody}>
          {/* QAD Andam Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="shirt-outline" size={14} color={colors.darkGray} />
              <Text style={styles.infoLabel}>Qad Andam</Text>
            </View>
            <Text style={styles.infoValue}>{item.qadAndamId}</Text>
          </View>

          {/* Amount Info */}
          <View style={styles.amountContainer}>
            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>{formatCurrency(item.totalAmount)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Paid Amount</Text>
              <Text style={[styles.amountValue, { color: colors.success }]}>
                {formatCurrency(item.paidAmount || 0)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Due Amount</Text>
              <Text style={[styles.amountValue, { color: hasDue ? colors.error : colors.success, fontWeight: '700' }]}>
                {formatCurrency(dueAmount)}
              </Text>
            </View>
          </View>

          {/* Due Date */}
          {item.dueDate && (
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="calendar-outline" size={14} color={colors.darkGray} />
                <Text style={styles.infoLabel}>Due Date</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(item.dueDate)}</Text>
            </View>
          )}

          {/* Description if available */}
          {item.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Notes</Text>
              <Text style={styles.descriptionText} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          )}
        </View>

        {/* Pay Button */}
        {hasDue && (
          <View style={styles.payButtonContainer}>
            <Ionicons name="card-outline" size={16} color={colors.white} />
            <Text style={styles.payButtonText}>Pay {formatCurrency(dueAmount)}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (invoices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={48} color={colors.border} />
        <Text style={styles.emptyText}>No Invoices</Text>
        <Text style={styles.emptySubtext}>Invoices will appear here</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={invoices}
      renderItem={renderInvoice}
      keyExtractor={(item, index) => item.id?.toString() || `invoice-${index}`}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.darkGray,
    marginTop: spacing.sm,
  },
  invoiceCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  invoiceCardHighlight: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  invoiceNumberSection: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  invoiceDate: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.darkGray,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  amountColumn: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    color: colors.darkGray,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  descriptionContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  descriptionLabel: {
    fontSize: 11,
    color: colors.darkGray,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
  payButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default InvoiceList;