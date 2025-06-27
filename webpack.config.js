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

  // Set public path dynamically based on environment
  // Use /SmokiApp/ for GitHub Pages deployment, / for development
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const publicPath = isGitHubPages ? '/SmokiApp/' : '/';
  
  config.output.publicPath = publicPath;
  
  // Fix asset paths for GitHub Pages
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.options.publicPath = publicPath;
    }
  });

  return config;
};
