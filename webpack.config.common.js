import { join, resolve } from 'path';
import webpack from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import SpritesmithPlugin from 'webpack-spritesmith';
import CopyPlugin from 'copy-webpack-plugin';
// const manifestBaseDll = require('./src/static/js/base-manifest.json');
// const manifestVenderDll = require('./src/static/js/vender-manifest.json');
let ENV = process.env.NODE_ENV;
if (!ENV) {
  const isProduction = process.argv.find((a) => {
    return a === '--mode=production';
  });
  ENV = isProduction ? 'production' : ENV;
}
const DEBUG = ENV !== 'production';
const packageJson = require('./package.json');
const buildVersion = packageJson.version;

export default {
  output: {
    path: join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'resources/js/[name]-[fullhash:10]-' + buildVersion + '.js',
    chunkFilename: 'resources/js/[name]-[contenthash:10]-' + buildVersion + '.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              extends: join(__dirname, '.babelrc'),
              cacheDirectory: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [DEBUG ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.less$/,
        use: [
          DEBUG ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[hash:10].[ext]',
              limit: 10000,
              outputPath: 'resources/images/',
            },
          },
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: '@svgr/webpack',
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        },
      },
    ],
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh_CN/),
    // new webpack.DllReferencePlugin({
    // 	context: __dirname,
    // 	manifest: manifestBaseDll,
    // }),
    // new webpack.DllReferencePlugin({
    // 	context: __dirname,
    // 	manifest: manifestVenderDll,
    // }),
    new HtmlPlugin({
      template: join(__dirname, 'src', 'index.ejs'),
      inject: true,
      ...(DEBUG ? { configsEnv: 'dev' } : {}),
      title: '',
      description: '',
      keywords: '',
      version: buildVersion,
      favicon: join(__dirname, 'src', 'favicon.ico'),
      production: process.env.electronMode == 'dev' ? false : true,
      minify: DEBUG
        ? {}
        : {
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeStyleLinkTypeAttributes: true,
            removeScriptTypeAttributes: true,
            trimCustomFragments: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
    }),
    ...(DEBUG
      ? []
      : [
          new MiniCssExtractPlugin({
            filename: 'resources/css/[name]-[contenthash:10]-' + buildVersion + '.css',
            chunkFilename: 'resources/css/[name]-[contenthash:10]-' + buildVersion + '.css',
          }),
        ]),
    new SpritesmithPlugin({
      src: {
        cwd: join(__dirname, 'src/sprite'),
        glob: '*.png',
      },
      target: {
        image: join(__dirname, 'build/sprite.png'),
        css: join(__dirname, 'build/sprite.less'),
      },
      apiOptions: {
        cssImageRef: '~sprite.png',
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/configs/*.js',
          to: 'resources/js/[name][ext]',
          noErrorOnMissing: true,
        },
        {
          from: 'src/static/js/*.js',
          to: 'resources/js/[name][ext]',
          noErrorOnMissing: true,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      // 兼容部分旧依赖硬编码引用 `path-to-regexp/index.js`（v6+ 实际入口在 dist/index.js）
      'path-to-regexp/index.js': 'path-to-regexp/dist/index.js',
      // 兼容部分依赖需要 `path-to-regexp` 的 default export
      'path-to-regexp$': resolve(__dirname, 'src/shims/path-to-regexp-compat.ts'),
      rework: 'rework.less/rework.less',
      sprite: 'sprite.less',
      core: '../../core',
      components: '../../components',
      '@utils': resolve(__dirname, 'src/utils'),
      '@image': resolve(__dirname, 'src/image'),
      '@sprite': resolve(__dirname, 'src/sprite'),
      '@Common': resolve(__dirname, 'src/components/Common'),
      '@services': resolve(__dirname, 'src/services'),
      '@models': resolve(__dirname, 'src/models'),
      '@components': resolve(__dirname, 'src/components'),
      '@widgets': resolve(__dirname, 'src/widgets'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [join(__dirname, 'build'), join(__dirname, 'node_modules')],
  },
  performance: {
    hints: DEBUG ? false : 'warning',
    maxAssetSize: 400000,
    maxEntrypointSize: 600000,
  },
  optimization: {
    moduleIds: 'deterministic',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
          name: 'common',
          priority: 1,
        },
        antd: {
          test: /antd/,
          minChunks: 2,
          chunks: 'all',
          priority: 2,
        },
        asyncs: {
          test: /node_modules/,
          chunks: 'async',
        },
      },
    },
    runtimeChunk: 'single',
  },
};
