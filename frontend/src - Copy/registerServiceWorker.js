import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with auto-update capability
export const initPWA = () => {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('[PWA] New content available, ready to refresh.');
      },
      onOfflineReady() {
        console.log('[PWA] MediClarity AI is ready to work offline.');
      },
      onRegisterError(error) {
        console.warn('[PWA] Service Worker registration failed:', error);
      }
    });
    return updateSW;
  }
};
