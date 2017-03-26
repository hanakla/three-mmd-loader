const path = require('path')
const webpack = require('webpack')

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: {
      'mmd-loader': './mmd-loader.ts',
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
  },
  resolve: {
      extensions: ['.js', '.ts'],
      modules: ['node_modules'],
  },
  module: {
      rules: [
          {
              test: /\.ts$/,
              loader: 'awesome-typescript-loader',
              exclude: /node_modules/,
          },
      ],
  },
}