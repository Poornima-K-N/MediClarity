import React from 'react';
import { Lightbulb, AlertTriangle, Check } from 'lucide-react';

export const QuickTips = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Educational Tips Card */}
      <section
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-md)',
          boxShadow: 'var(--shadow-sm)'
        }}
        aria-label="Document Scanning Tips"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-sm)' }}>
          <Lightbulb size={18} style={{ color: 'var(--color-warning)' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--color-text-main)' }}>
            Tips for Clear Medical Scans
          </h3>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
            <span>Place documents flat on a well-lit surface to avoid shadows and glare.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
            <span>Ensure reference ranges (normal limits) and units of measurement are in frame.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
            <span>For prescriptions, ensure medication names, dosage strength, and frequency are legible.</span>
          </li>
        </ul>
      </section>

      {/* Trust & Safety Disclaimer Card */}
      <aside className="disclaimer-card" role="note" aria-label="Medical Disclaimer">
        <AlertTriangle size={20} className="disclaimer-icon" />
        <div className="disclaimer-text">
          <strong>Medical & Educational Disclaimer</strong>
          MediClarity AI is strictly an educational tool to assist patients in understanding laboratory and prescription terms. It is not an alternative to licensed clinical judgment. In an emergency, contact your local emergency services immediately.
        </div>
      </aside>
    </div>
  );
};
