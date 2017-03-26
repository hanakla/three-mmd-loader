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
  externals: [
    (ctx, request, callback) => {
        if (/^(?!\.\.?\/|\!\!?)/.test(request)) {
            // throughs non relative requiring ('./module', '../module', '!!../module')
            return callback(null, `require('${request}')`)
        }

        callback()
    },
],
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