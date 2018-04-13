const path = require('path');
const useDefaultConfig = require('@ionic/app-scripts/config/webpack.config.js');

// Add src/ directory to webpack config to allow absolute paths in imports
useDefaultConfig.dev.resolve.modules.push(path.resolve('src'));
useDefaultConfig.prod.resolve.modules.push(path.resolve('src'));

module.exports = function () {
    return useDefaultConfig;
};
