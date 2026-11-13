import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  Sparkles,
  FlaskConical,
  Pill,
  ShieldAlert,
  Calendar,
  Building,
  KeyRound,
  AlertCircle,
  RotateCcw,
  Info
} from 'lucide-react';

export const StructuredMedicalDashboard = () => {
  const {
    aiStructuredData,
    aiAnalysisError,
    isAiKeyMissing,
    triggerGeminiAnalysis,
    isAnalyzingAI,
  } = useAppState();

  // If there's an error about a missing API key
  if (isAiKeyMissing) {
    return (
      <section className="structured-dashboard-card missing-key-banner" role="alert">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div className="missing-key-icon-wrapper">
            <KeyRound size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#92400E', marginBottom: '4px' }}>
              Gemini API Key Required for AI Extraction
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#B45309', lineHeight: '1.5' }}>
              The backend requires a Google Gemini API key to automatically parse medical documents into structured test tables and medication schedules.
            </p>

            <div style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              marginTop: '10px',
              fontSize: '0.8rem',
              color: '#78350F',
              fontFamily: 'monospace'
            }}>
              GEMINI_API_KEY=your_gemini_api_key_here
            </div>

            <p style={{ fontSize: '0.775rem', color: '#92400E', marginTop: '8px' }}>
              Set <code>GEMINI_API_KEY</code> in your environment or <code>backend/.env</code> file, then restart the Flask server.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // If general analysis error occurred
  if (aiAnalysisError && !aiStructuredData) {
    return (
      <div className="extraction-error-card" role="alert" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <AlertCircle size={20} className="error-icon" />
          <div>
            <strong>AI Extraction Error:</strong>
            <p style={{ marginTop: '2px', fontSize: '0.825rem' }}>{aiAnalysisError}</p>
          </div>
        </div>
        <button
          onClick={() => triggerGeminiAnalysis()}
          disabled={isAnalyzingAI}
          className="btn-ghost"
          style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}
        >
          <RotateCcw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!aiStructuredData) return null;

  const {
    document_type,
    document_title,
    detected_date,
    lab_or_clinic,
    summary_overview,
    lab_tests = [],
    medications = [],
    disclaimer,
  } = aiStructuredData;

  const getFlagBadge = (flag) => {
    if (!flag) {
      return (
        <span className="badge badge-flag-none">
          Not Flagged
        </span>
      );
    }

    const lower = flag.toLowerCase();
    if (lower === 'normal') {
      return (
        <span className="badge badge-ready">
          Normal
        </span>
      );
    } else if (lower.includes('high')) {
      return (
        <span className="badge badge-flag-high">
          High
        </span>
      );
    } else if (lower.includes('low')) {
      return (
        <span className="badge badge-flag-low">
          Low
        </span>
      );
    } else {
      return (
        <span className="badge badge-flag-abnormal">
          {flag}
        </span>
      );
    }
  };

  return (
    <section className="structured-dashboard-card" aria-label="Gemini AI Medical Extraction">
      {/* Brand Header & Metadata */}
      <div className="structured-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-ai-pulse">
            <Sparkles size={13} />
            <span>Gemini AI Extracted</span>
          </span>

          <span className="badge badge-guest" style={{ textTransform: 'capitalize' }}>
            {document_type ? document_type.replace('_', ' ') : 'Medical Document'}
          </span>
        </div>

        <h2 className="structured-main-title">
          {document_title || 'Medical Information Summary'}
        </h2>

        {(detected_date || lab_or_clinic) && (
          <div className="structured-meta-chips">
            {detected_date && (
              <span className="meta-chip">
                <Calendar size={13} />
                <span>Date: {detected_date}</span>
              </span>
            )}
            {lab_or_clinic && (
              <span className="meta-chip">
                <Building size={13} />
                <span>Facility: {lab_or_clinic}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary Overview */}
      {summary_overview && (
        <div className="structured-summary-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Info size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-main)' }}>
              Report Overview
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.55' }}>
            {summary_overview}
          </p>
        </div>
      )}

      {/* 1. Laboratory & Diagnostic Tests Section */}
      {lab_tests && lab_tests.length > 0 && (
        <div className="structured-section">
          <div className="structured-section-title">
            <FlaskConical size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Laboratory Results ({lab_tests.length} Parameters Extracted)</span>
          </div>

          <div className="tests-table-wrapper">
            <table className="tests-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Observed Value</th>
                  <th>Lab Reference Range</th>
                  <th>Status Flag</th>
                </tr>
              </thead>
              <tbody>
                {lab_tests.map((test, idx) => (
                  <tr key={idx}>
                    <td className="test-name-cell">
                      <strong>{test.test_name}</strong>
                    </td>
                    <td className="test-value-cell">
                      <span>{test.observed_value}</span>
                      {test.unit && <span className="test-unit"> {test.unit}</span>}
                    </td>
                    <td className="test-ref-cell">
                      {test.reference_range ? (
                        <span>{test.reference_range} {test.unit || ''}</span>
                      ) : (
                        <span className="text-muted-italic">Not provided in report</span>
                      )}
                    </td>
                    <td className="test-flag-cell">
                      {getFlagBadge(test.flag)}
                      {test.flag_reason && (
                        <div className="flag-reason-note">{test.flag_reason}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="grounding-footnote">
            <Info size={13} />
            <span>
              <strong>Factual Grounding:</strong> Reference ranges and flags are strictly extracted as written in the report. Ranges are never inferred or looked up.
            </span>
          </p>
        </div>
      )}

      {/* 2. Prescribed Medications Section */}
      {medications && medications.length > 0 && (
        <div className="structured-section">
          <div className="structured-section-title">
            <Pill size={18} style={{ color: 'var(--color-accent)' }} />
            <span>Prescription & Medication Instructions ({medications.length})</span>
          </div>

          <div className="medications-grid">
            {medications.map((med, idx) => (
              <div key={idx} className="medication-card">
                <div className="medication-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="medication-icon-circle">
                      <Pill size={16} />
                    </div>
                    <h4 className="medication-name">{med.name}</h4>
                  </div>
                  {med.dosage && (
                    <span className="badge badge-guest" style={{ fontWeight: '600' }}>
                      {med.dosage}
                    </span>
                  )}
                </div>

                <div className="medication-details-list">
                  {med.form && (
                    <div className="med-detail-item">
                      <span className="med-label">Form:</span>
                      <span className="med-val">{med.form}</span>
                    </div>
                  )}
                  {med.frequency && (
                    <div className="med-detail-item">
                      <span className="med-label">Frequency:</span>
                      <span className="med-val">{med.frequency}</span>
                    </div>
                  )}
                  {med.instructions && (
                    <div className="med-detail-item">
                      <span className="med-label">Directions:</span>
                      <span className="med-val">{med.instructions}</span>
                    </div>
                  )}
                  {med.duration && (
                    <div className="med-detail-item">
                      <span className="med-label">Duration:</span>
                      <span className="med-val">{med.duration}</span>
                    </div>
                  )}
                  {med.refills && (
                    <div className="med-detail-item">
                      <span className="med-label">Refills:</span>
                      <span className="med-val">{med.refills}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Safety & Educational Disclaimer */}
      <aside className="ai-disclaimer-strip" role="note">
        <ShieldAlert size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8rem', color: '#92400E', lineHeight: '1.45' }}>
          <strong>Medical Safety Disclaimer:</strong> {disclaimer}
        </div>
      </aside>
    </section>
  );
};
