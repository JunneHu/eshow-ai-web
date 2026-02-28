import { join } from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import ip from 'ip';
import commonConfig from './webpack.config.common';

export default merge(commonConfig, {
  devServer: {
    // host: ip.address(),
    host:'localhost',
    port: 3033,
    hot: true,
    compress: true,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    open: true,
    static: {
      directory: join(__dirname, 'dist'),
      publicPath: '/',
    },
  },
  entry: [join(__dirname, 'src', 'index.js')],
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true,
    }),
    new webpack.ProvidePlugin({
      Mock: 'mockjs',
      MockAdapter: 'axios-mock-adapter',
    }),
  ],
  devtool: 'inline-source-map',
});
