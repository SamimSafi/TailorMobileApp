import { Ionicons } from '@expo/vector-icons';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { formatDate } from '../utils/formatters';

const QadAndamList = ({ qadAndams, loading, onSelectQadAndam }) => {
  const renderMeasurements = (item) => {
    const measurements = [];
    if (item.qad) measurements.push(`Qad: ${item.qad}`);
    if (item.daman) measurements.push(`Daman: ${item.daman}`);
    if (item.astin) measurements.push(`Astin: ${item.astin}`);
    return measurements.join(' • ');
  };

  const renderItem = ({ item }) => {
    const statusColor = item.isActive ? colors.success : colors.error;
    const statusText = item.isActive ? 'Active' : 'Inactive';

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => onSelectQadAndam(item)}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons
              name={
                item.qadAndamType === 'Kala'
                  ? 'shirt-outline'
                  : item.qadAndamType === 'Waskat'
                    ? 'square-outline'
                    : 'checkmark-outline'
              }
              size={20}
              color={colors.primary}
            />
            <View style={styles.typeContainer}>
              <Text style={styles.type}>{item.qadAndamType}</Text>
              <Text style={styles.subType}>ID: {item.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.primary}
          />
        </View>

        <View style={styles.details}>
          {/* Type and Measurements */}
          {renderMeasurements(item) && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Measurements</Text>
              <Text style={styles.value} numberOfLines={1}>
                {renderMeasurements(item)}
              </Text>
            </View>
          )}

          {/* Dates */}
          <View style={styles.dateRow}>
            {item.enterDate && (
              <View style={styles.dateItem}>
                <Ionicons name="log-in-outline" size={14} color={colors.darkGray} />
                <Text style={styles.dateLabel}>Entered</Text>
                <Text style={styles.dateValue}>
                  {formatDate(item.enterDate)}
                </Text>
              </View>
            )}
            {item.registerDate && (
              <View style={styles.dateItem}>
                <Ionicons name="create-outline" size={14} color={colors.darkGray} />
                <Text style={styles.dateLabel}>Registered</Text>
                <Text style={styles.dateValue}>
                  {formatDate(item.registerDate)}
                </Text>
              </View>
            )}
            {item.returnDate && (
              <View style={styles.dateItem}>
                <Ionicons name="log-out-outline" size={14} color={colors.warning} />
                <Text style={styles.dateLabel}>Return</Text>
                <Text style={[styles.dateValue, { color: colors.warning }]}>
                  {formatDate(item.returnDate)}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          {item.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          )}
        </View>

        {/* Action Footer */}
        <View style={styles.footer}>
          <Ionicons name="add-circle" size={18} color={colors.primary} />
          <Text style={styles.footerText}>Create Invoice</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!qadAndams || qadAndams.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons
          name="folder-open"
          size={48}
          color={colors.border}
          style={{ marginBottom: spacing.md }}
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
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeContainer: {
    flex: 1,
  },
  type: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  subType: {
    fontSize: 12,
    color: colors.darkGray,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  statusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.darkGray,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateItem: {
    flex: 1,
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: colors.darkGray,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  descriptionContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  description: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary + '10',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.darkGray,
    textAlign: 'center',
  },
});

export default QadAndamList;

