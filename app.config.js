module.exports = {
  expo: {
    name: 'Patinha Certa', slug: 'patinha-certa', owner: 'ranielys', scheme: 'patinhacerta', version: '1.0.2',
    extra: { eas: { projectId: '12139fe3-eb2d-47f4-8857-a5ceba75599b' } },
    orientation: 'portrait', userInterfaceStyle: 'light',
    android: { package: 'br.com.patinhacerta.app', versionCode: 3, permissions: [] },
    ios: { bundleIdentifier: 'br.com.patinhacerta.app', buildNumber: '3', supportsTablet: true },
    web: { bundler: 'metro', output: 'static', name: 'Patinha Certa' },
    plugins: ['expo-router', 'expo-secure-store', ['expo-image-picker', { photosPermission: 'Selecione fotos do animal para o anúncio.', cameraPermission: false, microphonePermission: false }]],
    experiments: { baseUrl: process.env.EXPO_BASE_URL || '' }
  }
};
