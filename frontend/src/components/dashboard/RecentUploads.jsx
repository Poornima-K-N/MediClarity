import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { FileText, Eye, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export const RecentUploads = () => {
  const { syntheticReports, uploadedFiles, setSelectedDemoReport } = useAppState();

  return (
    <section aria-label="Sample and Uploaded Medical Reports">
      {/* 1. User Uploaded Files (UI Preview) */}
      {uploadedFiles.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="section-header">
            <h2 className="section-title">
              <Clock size={18} style={{ color: 'var(--color-primary)' }} />
              <span>Simulated Uploads ({uploadedFiles.length})</span>
            </h2>
            <span className="badge badge-guest">Module 1 UI Preview</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px var(--spacing-md)',
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-main)' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {file.size} • Uploaded at {file.timestamp}
                    </div>
                  </div>
                </div>

                <span className="badge badge-guest" style={{ fontSize: '0.7rem' }}>
                  {file.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Synthetic Demo Sample Cards */}
      <div>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
              <span>Synthetic Demo Reports</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Preview how reports will appear when analysis is integrated in Module 2.
            </p>
          </div>
          <span className="badge badge-demo">Synthetic Demo Data</span>
        </div>

        <div className="reports-grid">
          {syntheticReports.map((report) => (
            <article key={report.id} className="report-card">
              <div>
                <div className="report-card-top">
                  <span className="badge badge-demo">
                    Synthetic Demo Data
                  </span>
                  <span className="report-type-badge">
                    <FileText size={14} />
                    <span>{report.category}</span>
                  </span>
                </div>

                <h3 className="report-card-title">{report.title}</h3>
                <p className="report-card-date">{report.date} (Non-Clinical)</p>

                <div className="report-parameters-preview">
                  {report.parameters.map((param, pIdx) => (
                    <span key={pIdx} className="parameter-chip">
                      <strong>{param.name}:</strong> {param.value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="report-card-footer">
                <span className="badge badge-ready">
                  <CheckCircle2 size={12} />
                  <span>Layout Preview Ready</span>
                </span>

                <button
                  onClick={() => setSelectedDemoReport(report)}
                  className="btn-ghost"
                  style={{ fontSize: '0.825rem', color: 'var(--color-accent)', minHeight: '36px' }}
                  aria-label={`View synthetic details for ${report.title}`}
                >
                  <Eye size={14} />
                  <span>View Demo Data</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
