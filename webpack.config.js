const path = require('path');

module.exports = {
  mode: 'development',
  output: {
    filename: 'metar.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
      contentBase: './dist'
  }
};