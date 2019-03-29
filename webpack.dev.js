import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    mode: 'development',
    devtool: 'inline-source-map', // cheap-variant of SourceMap with module mappings
    context: __dirname,
    entry: [
        path.resolve(__dirname, 'src/index.dev.js'),
        'eventsource-polyfill', // necessary for hot reloading with IE
        'webpack-hot-middleware/client?reload=true', //note that it reloads the page if hot module reloading fails.
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'chart-builder.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'src'),
        noInfo: false,
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.dev.html',
            inject: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } },
            },
            { test: /\.html$/, use: [{ loader: 'html-loader' }] },
            { test: /\.css$/, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },
        ],
    },
};
