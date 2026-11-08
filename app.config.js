module.exports = {
  expo: {
    name: 'Patinha Certa', slug: 'patinha-certa', scheme: 'patinhacerta', version: '1.0.0',
    orientation: 'portrait', userInterfaceStyle: 'light',
    android: { package: 'br.com.patinhacerta.app', permissions: [] },
    ios: { bundleIdentifier: 'br.com.patinhacerta.app', supportsTablet: true },
    web: { bundler: 'metro', output: 'static', name: 'Patinha Certa' },
    plugins: ['expo-router', 'expo-secure-store', ['expo-image-picker', { photosPermission: 'Selecione fotos do animal para o anúncio.', cameraPermission: false, microphonePermission: false }]],
    experiments: { baseUrl: process.env.EXPO_BASE_URL || '' }
  }
};
