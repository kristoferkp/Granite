module.exports = function (api) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                '@tamagui/babel-plugin',
                {
                    components: ['tamagui'],
                    config: './tamagui.config.js',
                    logTimings: true,
                    disableExtraction: process.env.NODE_ENV === 'development',
                },
            ],
            // if you want to use a plugin for fast refresh:
            // ... other plugins
            'react-native-reanimated/plugin',
        ],
    }
}
