import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { UploadCloud, File, Info, CheckCircle2 } from 'lucide-react';

export const UploadZone = () => {
  const { handleSimulatedFileUpload, uploadToast } = useAppState();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSimulatedFileUpload(e.dataTransfer.files);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleSimulatedFileUpload(e.target.files);
    }
  };

  return (
    <section className="upload-card" aria-label="Upload Medical Documents">
      <div className="upload-card-header">
        <div>
          <h2 className="upload-card-title">Upload Health Documents</h2>
          <p className="upload-card-subtitle">
            Upload lab reports, blood work, or doctor prescriptions for simple explanations.
          </p>
        </div>
      </div>

      <div
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload document dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/jpg"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />

        <div className="dropzone-icon-circle">
          <UploadCloud size={28} />
        </div>

        <p className="dropzone-prompt">
          <span>Click to browse</span> or drag and drop your document here
        </p>
        <p className="dropzone-types">
          Supports clear scans, camera photos, or exported PDFs (max 15MB)
        </p>

        <div className="dropzone-formats">
          <span className="format-pill">PDF Document</span>
          <span className="format-pill">JPEG / PNG</span>
          <span className="format-pill">Lab Report</span>
          <span className="format-pill">Prescription</span>
        </div>
      </div>

      {uploadToast && (
        <div style={{
          marginTop: 'var(--spacing-md)',
          padding: '10px 14px',
          backgroundColor: 'var(--color-primary-subtle)',
          border: '1px solid var(--color-primary-light)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.825rem',
          color: 'var(--color-primary)',
          animation: 'fadeIn 200ms ease-out'
        }}>
          <CheckCircle2 size={16} />
          <span>{uploadToast}</span>
        </div>
      )}

      <div className="upload-preview-notice">
        <Info size={16} style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }} />
        <span>
          <strong>Module 1 UI-Only Preview:</strong> File picker & dropzone interaction is simulated. AI text recognition (OCR) and clinical summarization will be activated in Module 2.
        </span>
      </div>
    </section>
  );
};
