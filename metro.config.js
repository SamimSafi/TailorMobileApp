const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * Bundle size optimization configuration for production builds
 * Expected savings: 10-15MB per platform
 */
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Terser minification options
    compress: {
      // Compress to maximum
      passes: 2,
      // Remove all console statements
      drop_console: true,
      drop_debugger: true,
      // Pure function calls that can be dropped
      pure_funcs: [
        'console.log',
        'console.info',
        'console.debug',
        'console.warn',
      ],
      // Reduce variable declarations
      reduce_vars: true,
      // Remove unused code
      dead_code: true,
      // Inline simple variable assignments
      inline: 3,
      // Optimize conditionals
      conditionals: true,
    },
    // Mangle variable names to be shorter
    mangle: {
      keep_fnames: false, // Allow mangling of function names (more aggressive)
      keep_classnames: true, // Keep class names for debugging
      toplevel: true, // Mangle top-level names
    },
    // Remove unnecessary output formatting
    output: {
      comments: false,
      beautify: false,
    },
  },

  // Enable additional optimizations
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      // Enable inline requires for smaller bundles
      inlineRequires: true,
    },
  }),
};

module.exports = config;