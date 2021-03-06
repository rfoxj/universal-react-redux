import webpack from 'webpack';
import baseConfig from './production.babel';
import config from '../config';
import UglifyJSPlugin from 'uglifyjs-webpack-plugin';
import { mapValues } from 'lodash';
import nodeExternals from 'webpack-node-externals';
import path from 'path';

const plugins = [
  new webpack.DefinePlugin({
    'process.env': config.clientEnv
  }),
  new UglifyJSPlugin({
    sourceMap: true
  })
];

export default {
  ...baseConfig,
  context: null,
  target: 'node',
  entry: ['./server/renderer/handler.js'],
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    alias: mapValues(
      { ...config.clientResolvePaths, ...config.serverResolvePaths },
      str => path.join(process.cwd(), ...str.split('/'))
    )
  },
  externals: [
    // images are handled by isomorphic webpack.
    // html files are required directly
    /\.(html|png|gif|jpg)$/,
    // treat all node modules as external to keep this bundle small
    nodeExternals()
  ],
  output: {
    path: path.join(__dirname, '../', process.env.OUTPUT_PATH, 'renderer'),
    filename: 'handler.built.js',
    libraryTarget: 'commonjs'
  },
  plugins: [...baseConfig.plugins, ...plugins],
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.scss$/,
        exclude: [
          path.resolve(__dirname, '../node_modules'),
          path.resolve(__dirname, '../common/css/base')
        ],
        use: [
          {
            loader: 'css-loader/locals',
            options: {
              modules: true,
              minimize: false,
              importLoaders: 0,
              localIdentName: config.cssModulesIdentifier
            }
          },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: './common/css/resources/*.scss'
            }
          }
        ]
      }
    ]
  }
};
