const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin =  require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        base: ['react', 'react-dom', 'dva'],
        vender: ['axios', 'lodash', 'prop-types', 'history', 'dva-loading', 'react-router-dom'],
    },
    output: {
        path: path.join(__dirname, 'src/static/js'),
        filename: '[name].dll.js',
        /**
         * output.library
         * 将会定义为 window.${output.library}
         * 在这次的例子中，将会定义为`window.base_library`
         */
        library: '[name]_library'
    },
    plugins: [
        new webpack.DllPlugin({
            /**
             * path
             * 定义 manifest 文件生成的位置
             * [name]的部分由entry的名字替换
             */
            path: path.join(__dirname, 'src/static/js', '[name]-manifest.json'),
            /**
             * name
             * dll bundle 输出到那个全局变量上
             * 和 output.library 一样即可。 
             */
            name: '[name]_library'
        }),
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                  output: {
                    beautify: false,
                    comments: false,
                  },
                  compress: {
                    drop_console: true,
                    collapse_vars: true,
                    reduce_vars: true,
                  }
                }
            }),
        ],
    }
};