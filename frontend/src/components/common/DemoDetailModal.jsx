import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { X, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const DemoDetailModal = () => {
  const { selectedDemoReport, setSelectedDemoReport } = useAppState();

  if (!selectedDemoReport) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
      onClick={() => setSelectedDemoReport(null)}
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
              backgroundColor: 'var(--color-demo-bg)',
              color: 'var(--color-demo-badge)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={18} />
            </div>
            <div>
              <span className="badge badge-demo" style={{ marginBottom: '2px' }}>
                Synthetic Demo Data
              </span>
              <h2 id="demo-modal-title" className="modal-title" style={{ fontSize: '1rem' }}>
                {selectedDemoReport.title}
              </h2>
            </div>
          </div>
          <button
            onClick={() => setSelectedDemoReport(null)}
            className="modal-close-btn"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            backgroundColor: '#EEF2FF',
            border: '1px solid #C7D2FE',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            display: 'flex',
            gap: 'var(--spacing-sm)'
          }}>
            <AlertCircle size={20} style={{ color: '#4F46E5', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.825rem', color: '#3730A3', lineHeight: '1.45' }}>
              <strong>Notice: Synthetic Demonstration Record</strong>
              <p style={{ marginTop: '2px' }}>
                These values are purely synthetic placeholder samples to demonstrate the UI layout. No real patient data or clinical calculations are involved.
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-main)' }}>
            Simulated Lab Parameters:
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {selectedDemoReport.parameters.map((param, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: '500', color: 'var(--color-text-main)' }}>{param.name}</span>
                  <span style={{ marginLeft: '8px', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                    {param.value}
                  </span>
                </div>
                <span className="badge badge-ready">
                  <CheckCircle2 size={12} />
                  <span>{param.status}</span>
                </span>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
            borderLeft: '3px solid var(--color-primary)',
            paddingLeft: '10px',
            lineHeight: '1.4'
          }}>
            {selectedDemoReport.summaryNote}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={() => setSelectedDemoReport(null)}
            className="btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            Close Demo Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
