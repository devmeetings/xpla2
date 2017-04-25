var path = require('path');
var pkg = require('../package.json');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var DEBUG = process.env.NODE_ENV === 'development';
var TEST = process.env.NODE_ENV === 'test';
var RUN_SERVER = DEBUG ? 'http://localhost:3030' : 'https://xpla.org';
var PRESENCE_SERVER = DEBUG ? 'ws://localhost:3040' : 'wss://presence.xpla.org';

var jsxLoader;
var sassLoader;
var cssLoader;
var urlLoader = 'url?name=[path][name].[ext]';
var htmlLoader = [
  'file?name=[path][name].[ext]',
  'template-html?' + [
    'raw=true',
    'engine=lodash',
    'version=' + pkg.version,
    'run_server_url=' + RUN_SERVER,
    'presence_server_url=' + PRESENCE_SERVER,
    'title=' + pkg.name,
    'debug=' + DEBUG
  ].join('&')
].join('!');
var jsonLoader = ['json'];

var sassParams = [
  'outputStyle=expanded',
  'includePaths[]=' + path.resolve(__dirname, '../app/scss'),
  'includePaths[]=' + path.resolve(__dirname, '../node_modules')
];

var babel = 'babel?' + [
  'presets[]=react',
  'presets[]=latest',
  'presets[]=stage-0',
  'plugins[]=transform-runtime',
  'plugins[]=transform-decorators-legacy',
  'plugins[]=transform-flow-strip-types',
  'plugins[]=rewire'
].join('&');

if (DEBUG || TEST) {
  jsxLoader = [];
  if (!TEST) {
    jsxLoader.push('react-hot');
  }
  jsxLoader.push(babel);
  sassParams.push('sourceMap', 'sourceMapContents=true');
  sassLoader = [
    'style',
    'css?sourceMap&modules&localIdentName=[name]__[local]___[hash:base64:5]',
    'postcss',
    'sass?' + sassParams.join('&')
  ].join('!');
  cssLoader = [
    'style',
    'css?sourceMap',
    'postcss'
  ].join('!');
} else {
  jsxLoader = [babel];
  sassLoader = ExtractTextPlugin.extract('style', [
    'css?modules&localIdentName=[hash:base64:5]',
    'postcss',
    'sass?' + sassParams.join('&')
  ].join('!'));
  cssLoader = [
    'css',
    'postcss'
  ].join('!');
}

var loaders = [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loaders: (DEBUG || TEST) ? ['happypack/loader?id=jsx'] : jsxLoader
  },
  {
    test: /\.css$/,
    loader: (DEBUG || TEST) ? 'happypack/loader?id=css' : cssLoader
  },
  {
    test: /\.jpe?g$|\.gif$|\.png$|\.ico|\.svg$|\.woff$|\.ttf$/,
    loader: urlLoader
  },
  {
    test: /\.json$/,
    exclude: /node_modules/,
    loaders: jsonLoader
  },
  {
    test: /\.html$/,
    loader: htmlLoader
  },
  {
    test: /\.scss$/,
    loader: (DEBUG || TEST) ? 'happypack/loader?id=sass' : sassLoader
  }
];

module.exports = {
  loaders: loaders,
  js: jsxLoader,
  css: [cssLoader],
  sass: [sassLoader]
};
