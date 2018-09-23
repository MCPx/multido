var webpackConfig = require('./webpack.test.js');

console.log(webpackConfig.resolve.alias);

module.exports = function (config) {
    var _config = {
        basePath: '../',

        paths: {
            'services': ['src/services'],
            'pages': ['src/pages'],
            'enum': ['src/enum']
        },

        frameworks: ['jasmine'],

        files: [
            {
                pattern: './test-config/karma-test-shim.js',
                watched: true
            },
            {
                pattern: './src/assets/**/*',
                watched: false,
                included: false,
                served: true,
                nocache: false
            }
        ],

        mime: {
            'text/x-typescript': ['ts', 'tsx']
        },

        proxies: {
            '/assets/': '/base/src/assets/'
        },

        preprocessors: {
            './test-config/karma-test-shim.js': ['webpack', 'sourcemap']
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            stats: 'errors-only'
        },

        webpackServer: {
            noInfo: true
        },

        browserConsoleLogOptions: {
            level: 'log',
            format: '%b %T: %m',
            terminal: true
        },

        coverageIstanbulReporter: {
            reports: ['html', 'lcovonly'],
            fixWebpackSourcePaths: true
        },

        reporters: config.coverage ? ['kjhtml', 'dots', 'coverage-istanbul'] : ['kjhtml', 'dots'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false
    };

    config.set(_config);
};
