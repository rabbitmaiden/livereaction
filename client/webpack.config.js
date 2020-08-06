var path = require('path');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
  mode: 'production',
  entry: './src/client.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        loader: 'file-loader',
        options: {
          outputPath: 'images'
        }
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: 'src/*.html', flatten: true},
        {from: 'src/*.css', flatten: true}
      ]
    }),
  ],

  watch: true,
};