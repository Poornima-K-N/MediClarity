import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { User, LogIn, ArrowLeft } from 'lucide-react';

export const Header = () => {
  const { userState, setIsSignInModalOpen, setCurrentScreen } = useAppState();

  return (
    <header className="app-header" role="banner">
      <div className="app-header-content">
        <div className="app-brand">
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="btn-ghost"
            style={{ padding: '4px', minHeight: '36px' }}
            title="Back to Welcome Screen"
            aria-label="Back to Welcome Screen"
          >
            <ArrowLeft size={18} />
          </button>

          <img
            src="/logo.svg"
            alt="MediClarity AI"
            className="app-brand-logo"
          />
          <div className="app-brand-title">
            MediClarity
            <span className="app-brand-badge">AI</span>
          </div>
        </div>

        <div className="app-header-actions">
          <span className="badge badge-guest">
            <User size={13} />
            <span>{userState.displayName}</span>
          </span>

          <button
            onClick={() => setIsSignInModalOpen(true)}
            className="btn-ghost"
            style={{ fontSize: '0.825rem', minHeight: '36px' }}
            title="Authentication Preview"
          >
            <LogIn size={15} />
            <span style={{ display: 'none' }} className="desktop-only-inline">Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
};
