import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { FileText, Pill, ShieldCheck, ArrowRight, UserCheck, Lock } from 'lucide-react';

export const WelcomeScreen = () => {
  const { setCurrentScreen, setIsSignInModalOpen } = useAppState();

  return (
    <div className="welcome-container" role="main">
      <header className="welcome-header">
        <div className="welcome-brand-badge">
          <ShieldCheck size={16} />
          <span>Patient-First Medical Intelligence</span>
        </div>

        <h1 className="welcome-hero-title">
          Understand Your Medical Reports with Clarity
        </h1>
        <p className="welcome-hero-desc">
          Translate complex lab numbers, diagnostic summaries, and prescription instructions into straightforward, actionable insights.
        </p>
      </header>

      <section className="welcome-features" aria-label="Key Features">
        <div className="welcome-feature-card">
          <div className="welcome-feature-icon">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="welcome-feature-title">Plain-Language Lab Summaries</h2>
            <p className="welcome-feature-desc">
              Understand what CBC, lipid profiles, metabolic tests, and abbreviations mean without confusing jargon.
            </p>
          </div>
        </div>

        <div className="welcome-feature-card">
          <div className="welcome-feature-icon">
            <Pill size={22} />
          </div>
          <div>
            <h2 className="welcome-feature-title">Prescription Guidance</h2>
            <p className="welcome-feature-desc">
              Clear timing, dosage intervals, food directions, and questions to ask your doctor or pharmacist.
            </p>
          </div>
        </div>

        <div className="welcome-feature-card">
          <div className="welcome-feature-icon">
            <Lock size={22} />
          </div>
          <div>
            <h2 className="welcome-feature-title">Private & Controlled</h2>
            <p className="welcome-feature-desc">
              Your health data stays under your control. Guest mode processes files without requiring an account.
            </p>
          </div>
        </div>
      </section>

      <footer>
        <div className="welcome-actions">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className="btn-primary"
            aria-label="Continue as Guest"
          >
            <UserCheck size={20} />
            <span>Continue as Guest</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => setIsSignInModalOpen(true)}
            className="btn-secondary"
            aria-label="Sign In Preview"
          >
            <Lock size={18} />
            <span>Sign In (Preview)</span>
          </button>
        </div>

        <p className="welcome-disclaimer">
          MediClarity AI provides educational explanations for patient understanding. It does not replace medical advice, diagnosis, or professional treatment.
        </p>
      </footer>
    </div>
  );
};
