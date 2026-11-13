import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Layers,
  Sparkles,
  Cpu
} from 'lucide-react';

export const ExtractionPreview = () => {
  const { extractionResult, clearExtraction } = useAppState();
  const [copied, setCopied] = useState(false);
  const [selectedPageTab, setSelectedPageTab] = useState('all');

  if (!extractionResult) return null;

  const handleCopy = async () => {
    const textToCopy =
      selectedPageTab === 'all'
        ? extractionResult.extracted_text
        : extractionResult.pages?.find((p) => p.page_number === selectedPageTab)?.text ||
          extractionResult.extracted_text;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case 'digital_pdf':
        return {
          label: 'Digital PDF (PyMuPDF)',
          className: 'badge-digital',
          icon: FileText,
        };
      case 'ocr_scanned_pdf':
        return {
          label: 'Scanned PDF (Tesseract OCR)',
          className: 'badge-ocr',
          icon: Cpu,
        };
      case 'hybrid_pdf':
        return {
          label: 'Hybrid PDF (Digital + OCR)',
          className: 'badge-hybrid',
          icon: Sparkles,
        };
      case 'ocr_image':
        return {
          label: 'Image OCR (Tesseract)',
          className: 'badge-ocr',
          icon: Cpu,
        };
      default:
        return {
          label: method?.toUpperCase() || 'EXTRACTED',
          className: 'badge-digital',
          icon: FileText,
        };
    }
  };

  const methodInfo = getMethodBadge(extractionResult.extraction_method);
  const MethodIcon = methodInfo.icon;

  const currentDisplayText =
    selectedPageTab === 'all'
      ? extractionResult.extracted_text
      : extractionResult.pages?.find((p) => p.page_number === selectedPageTab)?.text ||
        'No text available for this page.';

  return (
    <section className="extraction-preview-card" aria-label="Extracted Medical Text Preview">
      {/* Header & Metadata Summary */}
      <div className="extraction-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className={`badge ${methodInfo.className}`}>
              <MethodIcon size={13} />
              <span>{methodInfo.label}</span>
            </span>
            <span className="badge badge-guest">
              <Layers size={13} />
              <span>{extractionResult.page_count} {extractionResult.page_count === 1 ? 'Page' : 'Pages'}</span>
            </span>
          </div>

          <h2 className="extraction-title">
            {extractionResult.filename}
          </h2>
          <div className="extraction-meta-subtitle">
            {extractionResult.word_count} words extracted • {extractionResult.char_count} characters
          </div>
        </div>

        <div className="extraction-actions">
          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '8px 14px', minHeight: '38px' }}
            aria-label="Copy extracted text to clipboard"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={clearExtraction}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px', minHeight: '38px' }}
            aria-label="Upload another document"
          >
            <RotateCcw size={16} />
            <span>Upload Another</span>
          </button>
        </div>
      </div>

      {/* Multi-Page Tabs (Shown if document has multiple pages) */}
      {extractionResult.pages && extractionResult.pages.length > 1 && (
        <div className="page-tabs-bar" role="tablist" aria-label="Document Pages">
          <button
            role="tab"
            aria-selected={selectedPageTab === 'all'}
            onClick={() => setSelectedPageTab('all')}
            className={`page-tab ${selectedPageTab === 'all' ? 'active' : ''}`}
          >
            All Pages ({extractionResult.pages.length})
          </button>

          {extractionResult.pages.map((p) => (
            <button
              key={p.page_number}
              role="tab"
              aria-selected={selectedPageTab === p.page_number}
              onClick={() => setSelectedPageTab(p.page_number)}
              className={`page-tab ${selectedPageTab === p.page_number ? 'active' : ''}`}
            >
              Page {p.page_number} [{p.method?.toUpperCase()}]
            </button>
          ))}
        </div>
      )}

      {/* Extracted Text Box */}
      <div className="extracted-text-viewer">
        <pre>{currentDisplayText}</pre>
      </div>

      {/* Zero-Retention Privacy Note */}
      <div className="ephemeral-privacy-footer">
        <ShieldCheck size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <span>
          <strong>Ephemeral Memory Processing:</strong> This medical document was parsed in volatile server memory. The file was automatically and securely deleted from disk upon completion.
        </span>
      </div>
    </section>
  );
};
