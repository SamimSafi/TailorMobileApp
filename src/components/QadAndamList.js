import { FileText, FolderOpen, LogIn, LogOut, Plus, Ruler } from 'lucide-react-native';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { enhancedTheme } from '../theme/enhancedTheme';
import { formatDate } from '../utils/formatters';

const QadAndamList = ({ qadAndams, loading, onSelectQadAndam, onViewReceipt }) => {
  const { t } = useLanguage();

  const renderDescription = (item) => {
    let descriptionData = null;

    // Try to use descriptionStructured if available
    if (item.descriptionStructured) {
      descriptionData = item.descriptionStructured;
    } else if (item.description) {
      // Try to parse the description JSON string
      try {
        const parsed = typeof item.description === 'string' ? JSON.parse(item.description) : item.description;
        descriptionData = parsed;
      } catch (_error) {
        // If parsing fails, display as plain text
        return (
          <View style={styles.descriptionContainer}>
            <Text style={styles.label}>{t('qadAndam.notes')}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        );
      }
    }

    if (!descriptionData) return null;

    const customFields = descriptionData.customFields || [];
    const freeText = descriptionData.freeText || '';

    return (
      <View style={styles.descriptionContainer}>
        <Text style={styles.label}>{t('qadAndam.notes')}</Text>

        {/* Custom Fields */}
        {customFields.map((field, index) => (
          <View key={field.id || index} style={styles.customFieldRow}>
            <Text style={styles.customFieldLabel}>{field.label}:</Text>
            <Text style={styles.customFieldValue}>{field.value}</Text>
          </View>
        ))}

        {/* Free Text */}
        {freeText && (
          <Text style={styles.description} numberOfLines={2}>
            {freeText}
          </Text>
        )}
      </View>
    );
  };

  const renderMeasurements = (item) => {
    const measurements = [];
    if (item.qad) measurements.push(`Qad: ${item.qad}`);
    if (item.daman) measurements.push(`Daman: ${item.daman}`);
    if (item.astin) measurements.push(`Astin: ${item.astin}`);
    return measurements.join(' • ');
  };

  const renderItem = ({ item }) => {
    const statusColor = item.isActive ? enhancedTheme.colors.success : enhancedTheme.colors.error;
    const statusText = item.isActive ? t('customer.active') : t('customer.inactive');

    return (
      <View style={styles.item}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => onViewReceipt && onViewReceipt(item)}
          activeOpacity={0.9}
        >
          <View style={styles.titleContainer}>
            <Ruler size={20} color={enhancedTheme.colors.primary} />
            <View style={styles.typeContainer}>
              <Text style={styles.type}>{item.qadAndamType}</Text>
              <Text style={styles.subType}>ID: {item.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.details}>
          {/* Type and Measurements */}
          {renderMeasurements(item) && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>{t('qadAndam.measurements')}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {renderMeasurements(item)}
              </Text>
            </View>
          )}

          {/* Dates */}
          <View style={styles.dateRow}>
            {item.enterDate && (
              <View style={styles.dateItem}>
                <LogIn size={14} color={enhancedTheme.colors.neutral600} />
                <Text style={styles.dateLabel}>{t('qadAndam.entered')}</Text>
                <Text style={styles.dateValue}>
                  {formatDate(item.enterDate)}
                </Text>
              </View>
            )}
            {item.registerDate && (
              <View style={styles.dateItem}>
                <LogIn size={14} color={enhancedTheme.colors.neutral600} />
                <Text style={styles.dateLabel}>{t('qadAndam.registered')}</Text>
                <Text style={styles.dateValue}>
                  {formatDate(item.registerDate)}
                </Text>
              </View>
            )}
            {item.returnDate && (
              <View style={styles.dateItem}>
                <LogOut size={14} color={enhancedTheme.colors.warning} />
                <Text style={styles.dateLabel}>{t('qadAndam.return')}</Text>
                <Text style={[styles.dateValue, { color: enhancedTheme.colors.warning }]}>
                  {formatDate(item.returnDate)}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {renderDescription(item)}
        </View>

        {/* Action Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onViewReceipt && onViewReceipt(item)}
          >
            <FileText size={18} color={enhancedTheme.colors.primary} />
            <Text style={styles.actionText}>{t('qadAndam.viewReceipt')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onSelectQadAndam(item)}
          >
            <Plus size={18} color={enhancedTheme.colors.primary} />
            <Text style={styles.actionText}>{t('qadAndam.createInvoice')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={enhancedTheme.colors.primary} />
      </View>
    );
  }

  if (!qadAndams || qadAndams.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <FolderOpen
          size={48}
          color={enhancedTheme.colors.neutral300}
          style={{ marginBottom: enhancedTheme.spacing.md }}
        />
        <Text style={styles.emptyText}>No QAD Andams found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={qadAndams}
      renderItem={renderItem}
      keyExtractor={(item, index) => item.id || item._id || item.qadAndamId || `qad-${index}`}
      scrollEnabled={false}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  item: {
    backgroundColor: enhancedTheme.colors.neutral50,
    borderRadius: enhancedTheme.borderRadius.md,
    marginBottom: enhancedTheme.spacing.md,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.neutral200,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: enhancedTheme.colors.neutral200,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: enhancedTheme.spacing.sm,
  },
  typeContainer: {
    flex: 1,
  },
  type: {
    fontSize: 15,
    fontWeight: '700',
    color: enhancedTheme.colors.neutral900,
  },
  subType: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral600,
    marginTop: enhancedTheme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: enhancedTheme.spacing.sm,
    paddingVertical: enhancedTheme.spacing.xs,
    borderRadius: enhancedTheme.borderRadius.sm,
  },
  statusText: {
    color: enhancedTheme.colors.neutral50,
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.md,
    gap: enhancedTheme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral600,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: enhancedTheme.colors.neutral900,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: enhancedTheme.spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: enhancedTheme.spacing.sm,
  },
  dateItem: {
    flex: 1,
    backgroundColor: enhancedTheme.colors.neutral50,
    borderRadius: enhancedTheme.borderRadius.sm,
    paddingHorizontal: enhancedTheme.spacing.sm,
    paddingVertical: enhancedTheme.spacing.sm,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: enhancedTheme.colors.neutral600,
    marginTop: enhancedTheme.spacing.xs,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral900,
    fontWeight: '600',
    marginTop: enhancedTheme.spacing.xs,
  },
  descriptionContainer: {
    backgroundColor: enhancedTheme.colors.neutral50,
    borderRadius: enhancedTheme.borderRadius.sm,
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.sm,
  },
  description: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral900,
    lineHeight: 16,
    marginTop: enhancedTheme.spacing.xs,
  },
  customFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: enhancedTheme.spacing.xs,
  },
  customFieldLabel: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral700,
    fontWeight: '500',
    flex: 1,
  },
  customFieldValue: {
    fontSize: 12,
    color: enhancedTheme.colors.neutral900,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: enhancedTheme.spacing.md,
    paddingVertical: enhancedTheme.spacing.md,
    backgroundColor: enhancedTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: enhancedTheme.colors.neutral200,
    gap: enhancedTheme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: enhancedTheme.spacing.sm,
    paddingVertical: enhancedTheme.spacing.sm,
    borderWidth: 1,
    borderColor: enhancedTheme.colors.primary + '40',
    borderRadius: enhancedTheme.borderRadius.sm,
    backgroundColor: enhancedTheme.colors.primary + '0D',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: enhancedTheme.colors.primary,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: enhancedTheme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: enhancedTheme.colors.neutral600,
    textAlign: 'center',
  },
});

export default QadAndamList;

