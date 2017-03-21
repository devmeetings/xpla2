var path = require('path');
var util = require('util');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HappyPack = require('happypack');
var webpack = require('webpack');
var pkg = require('../package.json');

var loaders = require('./loaders');

var DEBUG = process.env.NODE_ENV === 'development';
var TEST = process.env.NODE_ENV === 'test';

var cssBundle = path.join('css', util.format('[name].%s.css', pkg.version));

var plugins = [
  new HappyPack({
    id: 'jsx',
    loaders: loaders.js
  }),
  new HappyPack({
    id: 'css',
    loaders: loaders.css,
  }),
  new HappyPack({
    id: 'sass',
    loaders: loaders.sass,
  }),
  new webpack.optimize.OccurenceOrderPlugin(),
  new CopyWebpackPlugin([{
    from: '../static/'
  }])
];
if (DEBUG) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
} else if (!TEST) {
  plugins.push(
    new ExtractTextPlugin(cssBundle, {
      allChunks: true
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        VERSION: JSON.stringify(pkg.version),
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.NoErrorsPlugin()
  );
}

module.exports = plugins;
