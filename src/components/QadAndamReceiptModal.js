import { Ionicons } from '@expo/vector-icons';
import { Directory, File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import businessInfoDefaults from '../constants/businessInfo';
import { useLanguage } from '../hooks/useLanguage';
import { borderRadius, colors, spacing, typography } from '../theme/enhancedTheme';
import buildQadAndamReceiptHtml from '../utils/qadAndamReceiptHtml';
import { toastError, toastSuccess } from '../utils/toastManager';
import ModernButtonEnhanced from './ui/ModernButtonEnhanced';
import ModernEmptyState from './ui/ModernEmptyState';
import ModernLoading from './ui/ModernLoading';

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return '؋ 0.00';
  }
  return `؋ ${amount.toFixed(2)}`;
};

const sanitizeFileName = (value) => {
  if (!value) return 'receipt';
  const normalized = value
    .toString()
    .trim()
    .replace(/[^0-9A-Za-z\u0600-\u06FF_\- ]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || 'receipt';
};

const MASTER_TAILOR_FOLDER = 'MasterTailor';

const extractDirectoryUri = (entry) => {
  if (!entry) return null;
  if (typeof entry === 'string') return entry;
  if (typeof entry === 'object' && typeof entry.uri === 'string') {
    return entry.uri;
  }
  return null;
};

const ensureDownloadFolderAsync = async () => {
  const candidates = [
    extractDirectoryUri(Directory.downloads),
    extractDirectoryUri(Directory.downloadDirectory),
    extractDirectoryUri(Directory.documentDirectory),
    extractDirectoryUri(Directory.cacheDirectory),
    extractDirectoryUri(File.documentDirectory),
    extractDirectoryUri(File.cacheDirectory),
  ].filter(Boolean);

  let baseDirectory = '';
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const normalized = candidate.endsWith('/') ? candidate : `${candidate}/`;
      await File.makeDirectoryAsync(normalized, { intermediates: true });
      baseDirectory = normalized;
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!baseDirectory) {
    const fallback = `${File.cacheDirectory || ''}`;
    if (fallback) {
      baseDirectory = fallback.endsWith('/') ? fallback : `${fallback}/`;
    } else {
      throw lastError || new Error('Storage directory not available');
    }
  }

  const targetFolder = `${baseDirectory}${MASTER_TAILOR_FOLDER}/`;

  try {
    await File.makeDirectoryAsync(targetFolder, { intermediates: true });
  } catch (error) {
    console.warn('[QadAndamReceipt] Failed to create downloads folder, using base directory.', error);
    return baseDirectory;
  }

  return targetFolder;
};

const QadAndamReceiptModal = ({
  visible = false,
  onClose = () => {},
  qadAndam,
  customer,
  invoice,
  businessInfo = {},
}) => {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const customerDisplayName = useMemo(
    () =>
      sanitizeFileName(
        customer?.name ||
          customer?.customerName ||
          customer?.serial ||
          customer?.serialNumber ||
          'customer'
      ),
    [customer]
  );

  const receiptBaseName = useMemo(
    () =>
      sanitizeFileName(
        `${customerDisplayName}-${qadAndam?.qadAndamType || 'measurement'}`
      ),
    [customerDisplayName, qadAndam?.qadAndamType]
  );

  const normalizedBusinessInfo = useMemo(() => {
    const info = businessInfo || {};
    const fallback = businessInfoDefaults || {};
    const phoneNumbers = ensureArray(info.phoneNumbers).length
      ? ensureArray(info.phoneNumbers)
      : ensureArray(fallback.phoneNumbers);

    return {
      shopNameFull: info.shopNameFull || fallback.shopNameFull || '',
      ownerName: info.ownerName || fallback.ownerName || '',
      phoneNumbers,
      whatsapp: info.whatsapp || fallback.whatsapp || '',
      logos: {
        primary: info.logos?.primary || '',
      },
    };
  }, [businessInfo]);

  useEffect(() => {
    if (!visible || !qadAndam) {
      setPreviewHtml('');
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    try {
      setPreviewLoading(true);
      const html = buildQadAndamReceiptHtml({
        qadAndam,
        customer,
        invoice,
        businessInfo: normalizedBusinessInfo,
      });
      const enhancedHtml = html
        .replace(
          '</head>',
          `<style>
            @media screen {
              body {
                margin: 0 !important;
                padding: 8px !important;
                background-color: transparent !important;
              }
              .receipt {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 8px !important;
                border-radius: 8px !important;
              }
              body.preview-scale {
                width: 100%;
              }
            }
          </style></head>`
        )
        .replace('<body', '<body class="preview-scale"');
      setPreviewHtml(enhancedHtml);
      setPreviewError(null);
    } catch (error) {
      console.error('[QadAndamReceipt] Preview build failed', error);
      setPreviewHtml('');
      setPreviewError('نمایش رسید با مشکل مواجه شد.');
    } finally {
      setPreviewLoading(false);
    }
  }, [visible, qadAndam, customer, invoice, normalizedBusinessInfo]);

  const buildReceiptHtmlPayload = async () => {
    return buildQadAndamReceiptHtml({
      qadAndam,
      customer,
      invoice,
      businessInfo: normalizedBusinessInfo,
    });
  };

  const generatePdf = async () => {
    const html = await buildReceiptHtmlPayload();
    return Print.printToFileAsync({
      html,
      base64: false,
    });
  };

  const handleSavePdf = async () => {
    try {
      setBusy(true);
      const pdf = await generatePdf();
      const folderPath = await ensureDownloadFolderAsync();
      const fileName = `${receiptBaseName}-${Date.now()}.pdf`;
      const targetPath = `${folderPath}${fileName}`;

      await File.copyAsync(pdf.uri, targetPath);
      toastSuccess(t('qadAndam.savePDF'));
    } catch (error) {
      console.error('[QadAndamReceipt] Save failed', error);
      toastError(t('toast.error'));
    } finally {
      setBusy(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setBusy(true);
      const pdf = await generatePdf();
      if (!(await Sharing.isAvailableAsync())) {
        toastError(t('toast.error'));
        return;
      }

      await Sharing.shareAsync(pdf.uri, {
        dialogTitle: t('qadAndam.share'),
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('[QadAndamReceipt] Share failed', error);
      toastError(t('toast.error'));
    } finally {
      setBusy(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={24} color={colors.surface} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>رسید قد و اندام</Text>
      <View style={{ width: 32 }} />
    </View>
  );

  const renderPreview = () => {
    if (!qadAndam) {
      return (
        <ModernEmptyState
          icon={<Ionicons name="print-outline" size={48} color={colors.neutral400} />}
          title="هیچ دیتایی موجود نیست"
          description="لطفاً قد و اندام مورد نظر را انتخاب نمایید."
        />
      );
    }

    if (previewLoading) {
      return <ModernLoading visible message="در حال بارگذاری رسید..." />;
    }

    if (previewError) {
      return (
        <ModernEmptyState
          icon={<Ionicons name="alert-circle" size={48} color={colors.error} />}
          title="خطای نمایش رسید"
          description={previewError}
        />
      );
    }

    if (!previewHtml) {
      return (
        <ModernEmptyState
          icon={<Ionicons name="document-outline" size={48} color={colors.neutral400} />}
          title="رسید آماده نیست"
          description="اطلاعات لازم برای نمایش رسید در دسترس نیست."
        />
      );
    }

    return (
      <View style={styles.webPreviewContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html: previewHtml }}
          style={styles.webPreview}
          startInLoadingState
          renderLoading={() => <ModernLoading visible message="در حال بارگذاری رسید..." />}
          scrollEnabled
          javaScriptEnabled
          domStorageEnabled
          scalePageToFit
        />
      </View>
    );
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.sheet}>
          {renderHeader()}
          <View style={styles.divider} />

          <View style={styles.previewWrapper}>
            {busy ? (
              <View style={styles.loadingContainer}>
                <ModernLoading visible message="در حال آماده‌سازی رسيد..." />
              </View>
            ) : (
              renderPreview()
            )}
          </View>

          <View style={styles.footer}>
            <View style={styles.buttonWrapper}>
              <ModernButtonEnhanced
                title={t('qadAndam.savePDF')}
                variant="secondary"
                size="md"
                onPress={handleSavePdf}
                disabled={busy}
                icon={(props) => <Ionicons name="download-outline" {...props} />}
                fullWidth
              />
            </View>
            <View style={styles.buttonWrapper}>
              <ModernButtonEnhanced
                title={t('qadAndam.share')}
                variant="primary"
                size="md"
                onPress={handleSharePdf}
                disabled={busy}
                icon={(props) => <Ionicons name="logo-whatsapp" {...props} />}
                fullWidth
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 0,
    paddingBottom: 0,
    paddingTop: spacing.md,
    paddingHorizontal: 0,
    width: '100%',
    height: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.headlineSmall.fontSize,
    fontWeight: '700',
    color: colors.neutral900,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral100,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral200,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  previewWrapper: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  webPreviewContainer: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral200,
    overflow: 'hidden',
    backgroundColor: colors.neutral50,
  },
  webPreview: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral200,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default QadAndamReceiptModal;

