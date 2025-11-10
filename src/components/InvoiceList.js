import { ArrowRight, Calendar, CreditCard, Shirt } from 'lucide-react-native';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { enhancedTheme } from '../theme/enhancedTheme';
import { formatCurrency, formatDate } from '../utils/formatters';

const InvoiceList = ({ invoices, onSelectInvoice }) => {
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return enhancedTheme.colors.success;
      case 'partial':
        return enhancedTheme.colors.warning;
      case 'pending':
      case 'issued':
      default:
        return enhancedTheme.colors.error;
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
              <Shirt size={14} color={enhancedTheme.colors.neutral600} />
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
              <Text style={[styles.amountValue, { color: enhancedTheme.colors.success }]}>
                {formatCurrency(item.paidAmount || 0)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.amountColumn}>
              <Text style={styles.amountLabel}>Due Amount</Text>
              <Text style={[styles.amountValue, { color: hasDue ? enhancedTheme.colors.error : enhancedTheme.colors.success, fontWeight: '700' }]}>
                {formatCurrency(dueAmount)}
              </Text>
            </View>
          </View>

          {/* Due Date */}
          {item.dueDate && (
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Calendar size={14} color={enhancedTheme.colors.neutral600} />
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
            <CreditCard size={16} color={enhancedTheme.colors.surface} />
            <Text style={styles.payButtonText}>Pay {formatCurrency(dueAmount)}</Text>
            <ArrowRight size={16} color={enhancedTheme.colors.surface} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (invoices.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CreditCard size={48} color={enhancedTheme.colors.neutral300} />
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
    paddingVertical: enhancedTheme.spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: enhancedTheme.colors.neutral900,
    marginTop: enhancedTheme.spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: enhancedTheme.colors.neutral600,
    marginTop: enhancedTheme.spacing.sm,
  },
  invoiceCard: {
    backgroundColor: enhancedTheme.colors.surface,
    borderRadius: enhancedTheme.borderRadius.md,
    marginBottom: enhancedTheme.spacing.md,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
    overflow: 'hidden',
  },
  invoiceCardHighlight: {
    borderColor: enhancedTheme.colors.error,
    borderWidth: 1.5,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: enhancedTheme.colors.neutral200,
  },
  invoiceNumberSection: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: enhancedTheme.colors.neutral900,
  },
  invoiceDate: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral600,
    marginTop: enhancedTheme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.xs,
    borderRadius: enhancedTheme.borderRadius.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  invoiceBody: {
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: enhancedTheme.spacing.md,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: enhancedTheme.spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral600,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: enhancedTheme.colors.neutral900,
    fontWeight: '600',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: enhancedTheme.colors.neutral50,
    borderRadius: enhancedTheme.borderRadius.sm,
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.md,
    marginBottom: enhancedTheme.spacing.md,
  },
  amountColumn: {
    flex: 1,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    color: enhancedTheme.colors.neutral600,
    marginBottom: enhancedTheme.spacing.xs,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '700',
    color: enhancedTheme.colors.neutral900,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: enhancedTheme.colors.neutral200,
    marginHorizontal: enhancedTheme.spacing.sm,
  },
  descriptionContainer: {
    backgroundColor: enhancedTheme.colors.neutral50,
    borderRadius: enhancedTheme.borderRadius.sm,
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.sm,
    marginBottom: enhancedTheme.spacing.md,
  },
  descriptionLabel: {
    fontSize: 11,
    color: enhancedTheme.colors.neutral600,
    fontWeight: '500',
    marginBottom: enhancedTheme.spacing.xs,
  },
  descriptionText: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral900,
    lineHeight: 16,
  },
  payButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: enhancedTheme.spacing.sm,
    backgroundColor: enhancedTheme.colors.error,
    paddingVertical: enhancedTheme.spacing.md,
  },
  payButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: enhancedTheme.colors.surface,
  },
});

export default InvoiceList;