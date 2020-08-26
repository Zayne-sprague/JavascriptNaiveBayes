const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

var html_config = { // data available to template as htmlWebpackPlugin.options.*
    template: 'src/index.template.html', // input  https://github.com/emaphp/underscore-template-loader
    filename: 'index.html', // output html (assumes webpack output path; public/navigator )
    inject: 'body',
    hash: true,
    showErrors: false,
    STYLE_CSS_LINK_SUFFIX: `${(new Date()).getTime()}`, // compilation timestamp
};

module.exports = {
    // 1
    entry: './src/index.js',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },

    resolve: {
        extensions: ['*', '.js'],
        modules: [
            path.resolve(__dirname,'/'),
            'node_modules'
        ],
        alias:{
            'src': path.resolve( __dirname, './src/' )
        },

    },
    // 2
    output: {
        path: __dirname + '/public',
        publicPath: '/',
        filename: 'bundle.js'
    },
    // 3
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin(html_config),
    ],
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                sourceMap: true
            })
        ],
    },
    devServer: {
        contentBase: './public',
        hot: true //turn this off if you want to manually refresh yo
    }
};