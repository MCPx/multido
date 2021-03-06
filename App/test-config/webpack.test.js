var webpack = require('webpack');
var path = require('path');

module.exports = {
    devtool: 'eval-source-map',

    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            services: src('services'),
            pages: src('pages'),
            enums: src('enums'),
            models: src('models'),
            util: src('util')
        }
    },

    module: {
        rules: [{
            test: /\.ts$/,
            loaders: [{
                loader: 'ts-loader'
            }, 'angular2-template-loader']
        },
            {
                test: /.+\.ts$/,
                exclude: /(index.ts|mocks.ts|\.spec\.ts$)/,
                loader: 'istanbul-instrumenter-loader',
                enforce: 'post',
                query: {
                    esModules: true
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader?attrs=false'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
                loader: 'null-loader'
            }
        ]
    },

    plugins: [
        new webpack.ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /(ionic-angular)|(angular(\\|\/)core(\\|\/)@angular)/,
            src('.'), // location of your src
            {}
            // a map of your routes
        )
    ]
};

function src(localPath) {
    return path.resolve(__dirname, '../src', localPath);
}
