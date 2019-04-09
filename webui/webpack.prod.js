import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackExternalsPlugin from 'html-webpack-externals-plugin';

export default {
    mode: 'production',
    devtool: 'source-map',
    context: __dirname,
    entry: [path.resolve(__dirname, './src/index.prod.js')],
    output: {
        path: path.resolve(__dirname, 'dist'),
        // rename to proper file name
        filename: 'chart-builder.js',
        libraryTarget: 'var',
        library: 'ChartBuilder',
    },
    devServer: {
        contentBase: path.join(__dirname, 'src'),
        noInfo: false,
    },
    plugins: [
        // Create HTML file that includes reference to bundled JS.
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            filename: 'index.html',
            inject: 'head',
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
        }),
        new HtmlWebpackPlugin({
            template: 'src/about.html',
            filename: 'about.html',
            inject: 'head',
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
        }),
        new HtmlWebpackExternalsPlugin({
            externals: [
                {
                    module: 'jquery',
                    entry: 'dist/jquery.min.js',
                    global: 'jQuery',
                },
                {
                    module: 'bootstrap',
                    entry: ['dist/css/bootstrap.min.css', 'dist/js/bootstrap.min.js'],
                },
            ],
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
