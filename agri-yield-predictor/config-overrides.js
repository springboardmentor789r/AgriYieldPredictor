const { override, addWebpackResolve, addWebpackPlugin } = require('customize-cra');
const webpack = require('webpack');

module.exports = override(
  addWebpackResolve({
    fallback: {
      "buffer": require.resolve("buffer/"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/"),
      "util": require.resolve("util/"),
      "process": require.resolve("process/browser")
    },
    alias: {
      'xlsx$': 'xlsx/dist/xlsx.min.js'
    }
  }),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ),
  // Ignore source map warnings for mapbox and maplibre
  (config) => {
    // Ignore source map warnings for specific modules
    config.ignoreWarnings = [
      { module: /@plotly\/mapbox-gl/ },
      { module: /plotly\.js/ }
    ];
    return config;
  },
  // Fix for xlsx ESM modules
  (config) => {
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false
      }
    });
    return config;
  }
);
