import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Download, X, Smartphone } from 'lucide-react';

export const InstallBanner = () => {
  const { isInstallable, triggerInstallPrompt, dismissInstallPrompt } = useAppState();

  // Show prompt ONLY when supported by the browser
  if (!isInstallable) {
    return null;
  }

  return (
    <aside
      className="pwa-install-banner"
      role="banner"
      aria-label="Install MediClarity App"
    >
      <div className="pwa-install-info">
        <div className="pwa-install-icon">
          <Smartphone size={22} />
        </div>
        <div>
          <div className="pwa-install-title">Install MediClarity App</div>
          <div className="pwa-install-desc">
            Quick access from your home screen with offline capability.
          </div>
        </div>
      </div>

      <div className="pwa-install-actions">
        <button
          onClick={triggerInstallPrompt}
          className="btn-install"
          aria-label="Install application now"
        >
          <Download size={16} />
          <span>Install</span>
        </button>

        <button
          onClick={dismissInstallPrompt}
          className="btn-ghost"
          style={{ color: '#FFFFFF', padding: '6px', minHeight: '36px' }}
          aria-label="Dismiss install banner"
        >
          <X size={18} />
        </button>
      </div>
    </aside>
  );
};
