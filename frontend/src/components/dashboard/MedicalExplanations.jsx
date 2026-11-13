import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  BookOpen,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldCheck,
  Sparkles,
  Loader2
} from 'lucide-react';

export const MedicalExplanations = () => {
  const {
    medicalExplanations,
    isExplaining,
    explanationError,
    triggerMedicalExplanations,
    extractionResult,
  } = useAppState();

  if (!extractionResult) return null;

  const getStatusBadge = (status) => {
    if (!status) return null;
    const lower = status.toLowerCase();

    if (lower.includes('high') || lower.includes('higher')) {
      return (
        <span className="badge badge-flag-high">
          <TrendingUp size={12} />
          <span>{status}</span>
        </span>
      );
    }
    if (lower.includes('low') || lower.includes('lower')) {
      return (
        <span className="badge badge-flag-low">
          <TrendingDown size={12} />
          <span>{status}</span>
        </span>
      );
    }
    if (lower.includes('normal')) {
      return (
        <span className="badge badge-ready">
          <CheckCircle2 size={12} />
          <span>{status}</span>
        </span>
      );
    }
    return (
      <span className="badge badge-guest">
        <span>{status}</span>
      </span>
    );
  };

  return (
    <section className="structured-dashboard-card explanation-section-card" aria-label="Plain-Language Medical Explanations">
      <div className="section-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-ai-pulse">
              <BookOpen size={13} />
              <span>Module 4 • Plain-English Explanations</span>
            </span>
          </div>
          <h3 className="structured-main-title">
            Understanding Your Report
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Clear explanations comparing observed test values against report reference ranges.
          </p>
        </div>

        <button
          onClick={() => triggerMedicalExplanations()}
          disabled={isExplaining}
          className="btn-primary"
          style={{ fontSize: '0.825rem', padding: '8px 14px', minHeight: '36px' }}
          title="Translate laboratory and prescription terms into simple language"
        >
          {isExplaining ? (
            <>
              <Loader2 size={15} className="spinner-icon" />
              <span>Explaining...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>{medicalExplanations ? 'Refresh Explanations' : 'Explain in Simple English'}</span>
            </>
          )}
        </button>
      </div>

      {explanationError && (
        <div className="extraction-error-card" role="alert" style={{ marginTop: 'var(--spacing-md)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertTriangle size={18} className="error-icon" />
            <span style={{ fontSize: '0.825rem' }}>{explanationError}</span>
          </div>
        </div>
      )}

      {medicalExplanations && (
        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          {/* General Summary */}
          {medicalExplanations.general_summary && (
            <div className="structured-summary-box" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Info size={16} style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-main)' }}>
                  Plain-Language Summary
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
                {medicalExplanations.general_summary}
              </p>
            </div>
          )}

          {/* Test Explanations List */}
          {medicalExplanations.test_explanations && medicalExplanations.test_explanations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                Parameter Comparisons & Term Definitions
              </h4>

              {medicalExplanations.test_explanations.map((item, idx) => (
                <div key={idx} className="explanation-item-card">
                  <div className="explanation-item-header">
                    <div>
                      <span className="explanation-test-name">{item.test_name}</span>
                      <span className="explanation-observed-val">
                        Value: <strong>{item.observed_value}</strong>
                        {item.reference_range && (
                          <span style={{ color: 'var(--color-text-secondary)', marginLeft: '6px' }}>
                            (Lab Range: {item.reference_range})
                          </span>
                        )}
                      </span>
                    </div>
                    {getStatusBadge(item.status_summary)}
                  </div>

                  <div className="explanation-two-tier">
                    {/* Tier 1: Explicit Document Observation */}
                    <div className="tier-box tier-observation">
                      <div className="tier-label">
                        <CheckCircle2 size={13} style={{ color: 'var(--color-primary)' }} />
                        <span>Document Observation (From Your Report)</span>
                      </div>
                      <p className="tier-text">{item.document_observation}</p>
                    </div>

                    {/* Tier 2: Plain English Educational Explanation */}
                    <div className="tier-box tier-educational">
                      <div className="tier-label">
                        <BookOpen size={13} style={{ color: 'var(--color-accent)' }} />
                        <span>What This Means (Educational Definition)</span>
                      </div>
                      <p className="tier-text">{item.plain_english_explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Medication Explanations List */}
          {medicalExplanations.medication_explanations && medicalExplanations.medication_explanations.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                Prescription Guidance
              </h4>

              {medicalExplanations.medication_explanations.map((med, idx) => (
                <div key={idx} className="explanation-item-card">
                  <div className="explanation-item-header">
                    <span className="explanation-test-name">{med.medicine_name}</span>
                    {med.dosage && <span className="badge badge-guest">{med.dosage}</span>}
                  </div>
                  <div className="explanation-two-tier">
                    <div className="tier-box tier-observation">
                      <div className="tier-label">
                        <span>Prescription Directions (As Written)</span>
                      </div>
                      <p className="tier-text">{med.document_instructions || 'Take as indicated by doctor.'}</p>
                    </div>
                    <div className="tier-box tier-educational">
                      <div className="tier-label">
                        <span>Medication Purpose</span>
                      </div>
                      <p className="tier-text">{med.plain_english_purpose}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Questions to Ask Doctor */}
          {medicalExplanations.questions_for_doctor && medicalExplanations.questions_for_doctor.length > 0 && (
            <div className="doctor-questions-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <HelpCircle size={18} style={{ color: 'var(--color-primary)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                  Helpful Questions to Ask Your Doctor
                </h4>
              </div>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                {medicalExplanations.questions_for_doctor.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Educational Disclaimer */}
          <div className="ai-disclaimer-strip" style={{ marginTop: 'var(--spacing-lg)' }}>
            <ShieldCheck size={18} style={{ color: '#D97706', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#92400E' }}>
              {medicalExplanations.disclaimer || 'Explanations are strictly educational. Always consult your doctor for medical advice.'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
