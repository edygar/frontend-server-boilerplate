const path = require('path');

const servers = require('../src/config/servers');
const isomorphicConfig = require('./isomorphic.config');

const webpack = require('webpack');
const WebpackIsomorphicToolsPlugin = require('webpack-isomorphic-tools/plugin');
const universalizationPlugin = new WebpackIsomorphicToolsPlugin(isomorphicConfig);

const assetsPath = path.resolve(__dirname, '../public/dist/');

const host = servers.self.host || 'localhost';
const port = (servers.self.port + 1) || 3001;
const prefix = servers.self.prefix || '';

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  context: path.resolve(__dirname, '..'),
  progress: true,

  entry: {
    main: [
      'webpack-hot-middleware/client?path=http://' + host + ':' + port + prefix + '/__webpack_hmr',
      './src/client.js'
    ]
  },

  output: {
    path: assetsPath,
    filename: '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: 'http://' + host + ':' + port + '/public/dist/'
  },

  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: ['babel', 'eslint-loader']},
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml" },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?' + [
            'modules',
            'sourceMap',
            'importLoaders=1',
            'localIdentName=[name]__[local]___[hash:base64:5]'
          ].join('&') ,
          'postcss-loader'
        ]
      },
      {
        test: universalizationPlugin.regular_expression('images'),
        loader: 'url-loader?limit=10240', // any image below or equal to 10K will be converted to inline base64 instead
      }
    ]
  },

  'postcss': [
    require('autoprefixer'),
    require('postcss-cssnext')
  ],

  rejolve: {
    modulesDirectories: [ 'src', 'node_modules' ],
    extensions: ['', '.json', '.js', '.jsx']
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/webpack-stats\.json$/),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      '__SERVER__': false,
      '__CLIENT__': true,

      'process.env': {
        'NODE_ENV': '"development"'
      }
    }),
    universalizationPlugin.development()
  ]
};
