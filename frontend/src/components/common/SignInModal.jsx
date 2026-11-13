import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { X, Lock, Info, CheckCircle, ArrowRight } from 'lucide-react';

export const SignInModal = () => {
  const { isSignInModalOpen, setIsSignInModalOpen, setCurrentScreen } = useAppState();

  if (!isSignInModalOpen) return null;

  const handleContinueGuest = () => {
    setIsSignInModalOpen(false);
    setCurrentScreen('dashboard');
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      onClick={() => setIsSignInModalOpen(false)}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={18} />
            </div>
            <h2 id="signin-modal-title" className="modal-title">
              Sign In (Preview Mode)
            </h2>
          </div>
          <button
            onClick={() => setIsSignInModalOpen(false)}
            className="modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            backgroundColor: 'var(--color-bg-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            display: 'flex',
            gap: 'var(--spacing-sm)'
          }}>
            <Info size={20} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.45' }}>
              <strong style={{ color: 'var(--color-text-main)', display: 'block', marginBottom: '2px' }}>
                Authentication Architecture Notice
              </strong>
              User accounts, session management, and encrypted patient vaults will connect to the Flask backend in a future module. For now, you have full access as a <strong>Guest Patient</strong>.
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                Email Address (Preview)
              </label>
              <input
                type="email"
                placeholder="patient@example.com"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#F8FAFC',
                  color: 'var(--color-text-muted)',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                Password (Preview)
              </label>
              <input
                type="password"
                value="••••••••••••"
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#F8FAFC',
                  color: 'var(--color-text-muted)',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={() => setIsSignInModalOpen(false)}
            className="btn-secondary"
            style={{ fontSize: '0.875rem' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinueGuest}
            className="btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            <CheckCircle size={16} />
            <span>Continue as Guest</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
