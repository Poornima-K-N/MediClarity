import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { UploadCloud, Loader2, AlertCircle, FileText, CheckCircle2, X } from 'lucide-react';

export const UploadZone = () => {
  const {
    processRealFileUpload,
    isExtracting,
    activeUploadName,
    extractionError,
    clearExtraction,
    uploadToast,
  } = useAppState();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const onDragOver = (e) => {
    e.preventDefault();
    if (!isExtracting) {
      setIsDragging(true);
    }
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isExtracting) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processRealFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processRealFileUpload(e.target.files[0]);
      // Reset input value so same file can be re-selected if desired
      e.target.value = '';
    }
  };

  return (
    <section className="upload-card" aria-label="Upload Medical Documents">
      <div className="upload-card-header">
        <div>
          <h2 className="upload-card-title">Upload Health Documents</h2>
          <p className="upload-card-subtitle">
            Upload lab reports, blood panels, or doctor prescriptions for automated text extraction.
          </p>
        </div>
      </div>

      {/* Main Interactive Dropzone */}
      <div
        className={`dropzone ${isDragging ? 'active' : ''} ${isExtracting ? 'processing' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isExtracting && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!isExtracting && (e.key === 'Enter' || e.key === ' ')) {
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
          disabled={isExtracting}
          onChange={onFileChange}
        />

        {isExtracting ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px' }}>
            <div className="processing-pulse-circle">
              <Loader2 size={36} className="spinner-icon" />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-primary)' }}>
                Processing Document...
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Analyzing <strong>{activeUploadName}</strong> using PyMuPDF and Tesseract OCR
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Ephemeral processing • Zero disk retention
            </div>
          </div>
        ) : (
          <>
            <div className="dropzone-icon-circle">
              <UploadCloud size={28} />
            </div>

            <p className="dropzone-prompt">
              <span>Click to browse</span> or drag and drop your document here
            </p>
            <p className="dropzone-types">
              Digital or scanned PDFs (up to 10 pages) • Clear camera photos (up to 10 MB)
            </p>

            <div className="dropzone-formats">
              <span className="format-pill">PDF (Max 10 Pages)</span>
              <span className="format-pill">PNG / JPEG Photos</span>
              <span className="format-pill">Max 10 MB</span>
              <span className="format-pill">PyMuPDF + Tesseract</span>
            </div>
          </>
        )}
      </div>

      {/* Extraction Error Notice */}
      {extractionError && (
        <div className="extraction-error-card" role="alert">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle size={20} className="error-icon" />
            <div>
              <strong>Extraction Notice:</strong>
              <p style={{ marginTop: '2px', fontSize: '0.825rem' }}>{extractionError}</p>
            </div>
          </div>
          <button
            onClick={clearExtraction}
            className="btn-ghost"
            style={{ padding: '4px', minHeight: '32px' }}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success Toast */}
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
    </section>
  );
};
