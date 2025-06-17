const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper handling of web builds
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

module.exports = config;