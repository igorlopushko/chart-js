import webpack from 'webpack';
import path from 'path';

export default {
    mode: 'development',
    devtool: 'inline-source-map', // cheap-variant of SourceMap with module mappings
    context: __dirname,
    entry: [
        path.resolve(__dirname, 'src/index'),
        'eventsource-polyfill', // necessary for hot reloading with IE
        'webpack-hot-middleware/client?reload=true', //note that it reloads the page if hot module reloading fails.
    ],
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'src'),
        noInfo: false,
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } },
            },
            { test: /\.css$/, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: [{ loader: 'file-loader', options: {} }] },
            { test: /\.(woff|woff2)$/, use: [{ loader: 'url?prefix=font/&limit=5000' }] },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                use: [{ loader: 'url?limit=10000&mimetype=application/octet-stream' }],
            },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: [{ loader: 'url?limit=10000&mimetype=image/svg+xml' }] },
        ],
    },
};
