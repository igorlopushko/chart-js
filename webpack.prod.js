import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    mode: 'production',
    devtool: 'source-map',
    context: __dirname,
    entry: [path.resolve(__dirname, 'src/index')],
    target: 'web',
    output: {
        path: path.resolve(__dirname, 'dist'),
        // rename to proper file name
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'src'),
        noInfo: false,
    },
    plugins: [
        // Create HTML file that includes reference to bundled JS.
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
            inject: false,
            // Properties you define here are available in index.html
            // using htmlWebpackPlugin.options.varName
            trackJSToken: '43ad216f57d94259968435894490a5c7',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: { loader: 'babel-loader', options: { presets: ['minify'] } },
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
