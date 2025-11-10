import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import defaultBusinessInfo from '../constants/businessInfo';

const STORAGE_KEY = 'BUSINESS_INFO_SETTINGS';

const resolveLogoAsset = async () => {
  try {
    const asset = Asset.fromModule(defaultBusinessInfo.logos?.primary);
    if (!asset.downloaded) {
      await asset.downloadAsync();
    }

    const fileUri = asset.localUri || asset.uri;
    if (!fileUri) {
      return '';
    }

    const encoding =
      FileSystem.EncodingType && FileSystem.EncodingType.Base64
        ? FileSystem.EncodingType.Base64
        : 'base64';

    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding,
    });

    const mimeType = asset.type ? `image/${asset.type}` : 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.warn('[BusinessInfoService] Failed to resolve logo asset:', error);
    return '';
  }
};

const normalizeBusinessInfo = (info) => {
  if (!info) return null;

  return {
    shopNameFull: info.shopNameFull ?? '',
    ownerName: info.ownerName ?? '',
    phoneNumbers: Array.isArray(info.phoneNumbers) ? info.phoneNumbers : [],
    whatsapp: info.whatsapp ?? '',
    logos: {
      primary: info.logos?.primary ?? '',
    },
  };
};

export const getStoredBusinessInfo = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return normalizeBusinessInfo(JSON.parse(raw));
  } catch (error) {
    console.warn('[BusinessInfoService] Failed to load stored info:', error);
    return null;
  }
};

export const saveBusinessInfo = async (info) => {
  try {
    const normalized = normalizeBusinessInfo(info);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    console.warn('[BusinessInfoService] Failed to save info:', error);
    throw error;
  }
};

const buildDefaultBusinessInfo = async () => {
  const logoDataUrl = await resolveLogoAsset();
  return normalizeBusinessInfo({
    ...defaultBusinessInfo,
    logos: {
      primary: logoDataUrl,
    },
  });
};

export const ensureBusinessInfoInitialized = async () => {
  const stored = await getStoredBusinessInfo();
  if (stored) {
    return stored;
  }

  const defaultInfo = await buildDefaultBusinessInfo();
  await saveBusinessInfo(defaultInfo);
  return defaultInfo;
};

export default {
  ensureBusinessInfoInitialized,
  getStoredBusinessInfo,
  saveBusinessInfo,
};

