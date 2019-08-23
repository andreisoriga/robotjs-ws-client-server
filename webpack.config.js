const path = require('path');

module.exports = {
  entry: './src/server.js',
  target: 'node',
  output: {
    filename: 'bundle.server.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  }
};
