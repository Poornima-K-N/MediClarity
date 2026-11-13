import React, { useEffect } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { ChevronRight } from 'lucide-react';

export const SplashScreen = () => {
  const { setCurrentScreen } = useAppState();

  useEffect(() => {
    // Transition after 3.5 seconds
    const timer = setTimeout(() => {
      setCurrentScreen('welcome');
    }, 3500);

    return () => clearTimeout(timer);
  }, [setCurrentScreen]);

  return (
    <div className="splash-container" role="main" aria-label="Loading MediClarity AI">
      <div className="splash-logo-wrapper">
        <div className="splash-logo-glow" aria-hidden="true" />
        <img
          src="/logo.svg"
          alt="MediClarity AI Logo"
          className="splash-logo-img"
        />
      </div>

      <h1 className="splash-title">
        MediClarity <span>AI</span>
      </h1>
      
      <p className="splash-subtitle">
        Your medical reports and prescriptions, clearly explained.
      </p>

      <div className="splash-progress-track" aria-hidden="true">
        <div className="splash-progress-bar" />
      </div>

      <button
        onClick={() => setCurrentScreen('welcome')}
        className="splash-skip-btn"
        aria-label="Skip splash screen"
      >
        <span>Skip intro</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
