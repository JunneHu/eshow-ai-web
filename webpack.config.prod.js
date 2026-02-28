import { join } from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import AssetsPlugin from 'assets-webpack-plugin';
import commonConfig from './webpack.config.common';

export default merge(commonConfig, {
  entry: [
    join(__dirname, 'src/index.js'),
  ],
  plugins: [
    new webpack.DefinePlugin({
      '__DEV__': false,
    }),
    new webpack.EnvironmentPlugin({
      'electronMode': JSON.stringify(process.env.electronMode),
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [join(__dirname, 'dist')],
    }),
    new AssetsPlugin({
      path: join(__dirname, 'build'),
      includeManifest: join(__dirname, 'build/manifest'),
    }),
  ],
});
