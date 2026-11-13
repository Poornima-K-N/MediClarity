import React, { useEffect } from 'react';
import { useAppState } from './context/AppStateContext';
import { SplashScreen } from './components/splash/SplashScreen';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { SignInModal } from './components/common/SignInModal';
import { initPWA } from './registerServiceWorker';

export default function App() {
  const { currentScreen } = useAppState();

  useEffect(() => {
    initPWA();
  }, []);

  return (
    <div className="medclarity-app">
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'welcome' && (
        <>
          <WelcomeScreen />
          <SignInModal />
        </>
      )}
      {currentScreen === 'dashboard' && <DashboardScreen />}
    </div>
  );
}
