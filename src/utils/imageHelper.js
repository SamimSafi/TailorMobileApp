/**
 * Image Helper - Unified image loading using Expo Image
 * 
 * Provides a clean wrapper around expo-image for consistent image handling
 * across the app with optimization, caching, and error handling.
 */

import * as ExpoImage from 'expo-image';

/**
 * Default image loading options
 */
export const DEFAULT_IMAGE_OPTIONS = {
  cachePolicy: ExpoImage.CachePolicy.MEMORY_AND_DISK,
  contentFit: 'cover',
  transition: 300,
};

/**
 * Get optimized image component with standard defaults
 * @param {object} props - Image component props
 * @returns {React.Component} Optimized Image component
 * 
 * Usage:
 * import { ExpoImage } from '../utils/imageHelper';
 * 
 * <ExpoImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   style={{ width: 200, height: 200 }}
 *   contentFit="cover"
 * />
 */
export const { Image: ExpoImage } = ExpoImage;

/**
 * Preload images for faster display
 * @param {array} uris - Array of image URIs to preload
 * 
 * Usage:
 * import { preloadImages } from '../utils/imageHelper';
 * 
 * useEffect(() => {
 *   preloadImages([
 *     'https://example.com/image1.jpg',
 *     'https://example.com/image2.jpg'
 *   ]);
 * }, []);
 */
export const preloadImages = async (uris) => {
  try {
    const promises = uris.map(uri => 
      ExpoImage.Image.prefetch(uri)
    );
    await Promise.all(promises);
    console.log('✓ Images preloaded:', uris.length);
  } catch (error) {
    console.warn('Warning: Image preload failed', error);
  }
};

/**
 * Clear all cached images
 * Useful for clearing old cached data when needed
 * 
 * Usage:
 * import { clearImageCache } from '../utils/imageHelper';
 * 
 * clearImageCache();
 */
export const clearImageCache = async () => {
  try {
    await ExpoImage.Image.clearDiskCache();
    await ExpoImage.Image.clearMemoryCache();
    console.log('✓ Image cache cleared');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

/**
 * Optimized image component with fallback
 * @param {object} props - Image props
 * @returns {React.Component} Image with fallback
 * 
 * Usage:
 * import { OptimizedImage } from '../utils/imageHelper';
 * 
 * <OptimizedImage
 *   source={{ uri: imageUrl }}
 *   fallback={require('../assets/placeholder.png')}
 *   style={{ width: 100, height: 100 }}
 * />
 */
export const OptimizedImage = ({ 
  source, 
  fallback,
  style,
  ...props 
}) => {
  return (
    <ExpoImage.Image
      source={source || fallback}
      style={style}
      cachePolicy={DEFAULT_IMAGE_OPTIONS.cachePolicy}
      contentFit={DEFAULT_IMAGE_OPTIONS.contentFit}
      transition={DEFAULT_IMAGE_OPTIONS.transition}
      {...props}
    />
  );
};

/**
 * Image cache policies for different use cases
 */
export const ImageCachePolicies = {
  // Use only memory cache (fastest, not persistent)
  MEMORY_ONLY: ExpoImage.CachePolicy.MEMORY,
  
  // Use memory and disk cache (balanced)
  MEMORY_AND_DISK: ExpoImage.CachePolicy.MEMORY_AND_DISK,
  
  // Use only disk cache (persistent)
  DISK_ONLY: ExpoImage.CachePolicy.DISK,
  
  // No caching (always fresh)
  NONE: ExpoImage.CachePolicy.NONE,
};

/**
 * Image content fit options
 */
export const ImageContentFit = {
  COVER: 'cover',      // Scale to cover area, may crop
  CONTAIN: 'contain',  // Scale to fit, may have space
  FILL: 'fill',        // Stretch to fill
  SCALE_DOWN: 'scale-down', // Scale down if larger
};

export default ExpoImage;