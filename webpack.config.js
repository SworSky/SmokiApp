const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@react-navigation/native',
          '@react-navigation/native-stack',
          '@react-navigation/elements',
        ],
      },
    },
    argv
  );

  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "buffer": false,
  };

  // Add alias for better module resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
  };

  // Set public path for GitHub Pages deployment
  config.output.publicPath = '/SmokiApp/';
  
  // Fix asset paths for GitHub Pages
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.publicPath = '/SmokiApp/';
    }
  });

  return config;
};
