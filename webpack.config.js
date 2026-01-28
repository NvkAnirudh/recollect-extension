const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './src/popup/index.tsx',
    'background/service-worker': './src/background/service-worker.ts',
    'content/webapp-sync': './src/content/webapp-sync.ts',
    'content/linkedin': './src/content/linkedin.ts',
    'content/instagram': './src/content/instagram.ts',
    'content/youtube': './src/content/youtube.ts',
    'content/tiktok': './src/content/tiktok.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup'],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'public', to: 'public' },
        { from: 'src/content/*.css', to: 'src/content/[name][ext]', noErrorOnMissing: true },
      ],
    }),
  ],
};
