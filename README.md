# MediClarity AI — Medical Report & Prescription Assistant

MediClarity AI is an installable, mobile-friendly Progressive Web App (PWA) designed to help patients and caregivers understand laboratory reports, diagnostics, and prescriptions in plain language.

---

## Architecture Overview

- **Module 1 (Completed):** Project Setup, Responsive UI Foundation, and PWA Architecture (React + Vite + CSS).
- **Module 2 (Completed):** Document Upload & Text Extraction (PyMuPDF Digital Parsing + Tesseract OCR Fallback + Ephemeral Privacy Processing + Flask API).
- **Module 3 (Upcoming):** Medical Analysis Engine & Simplified Explanations.

```
MediClarity/
├── frontend/                     # React + Vite PWA Application
│   ├── public/                   # PWA Manifest icons, Favicon, Brand SVGs
│   ├── src/
│   │   ├── components/           # Splash, Welcome, Dashboard, ExtractionPreview
│   │   ├── context/              # AppStateContext (Navigation & volatile extraction store)
│   │   ├── services/             # Client API service for /api/process-document
│   │   ├── styles/               # Design Tokens, Globals, and Component styling
│   │   ├── App.jsx               # Screen orchestrator
│   │   └── main.jsx              # Application bootstrap
│   ├── vite.config.js            # Vite build configuration + PWA + /api proxy
│   └── package.json
│
├── backend/                      # Python Flask Backend
│   ├── app/
│   │   ├── routes/               # POST /api/process-document & GET /api/health
│   │   ├── services/             # validator.py, cleaner.py, extractor.py
│   │   ├── config.py             # 10MB limit, 10-page ceiling, Tesseract path
│   │   └── __init__.py           # Flask factory with zero-cache security headers
│   ├── tests/                    # Synthetic non-clinical fixtures & unittest suite
│   ├── Dockerfile                # Production container for Render deployment
│   ├── requirements.txt
│   └── run.py                    # Server entry point (http://127.0.0.1:5000)
│
├── .gitignore
├── generate-icons.cjs
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)
- Tesseract OCR (v5.0+ installed on host, or via container)

---

### 1. Run the Flask Backend

```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run the test suite
python -m unittest backend/tests/test_extraction.py

# Start the Flask server
python backend/run.py
# Server will run on http://127.0.0.1:5000
```

---

### 2. Run the React Frontend PWA

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite local development server
npm run dev
# Frontend runs on http://localhost:5173/ and proxies /api to http://127.0.0.1:5000

# Build for production & PWA validation
npm run build
```

---

## Module 2 Document Processing Highlights

1. **Selective Hybrid Text Extraction:**
   - **Digital PDFs:** Extracted instantly via PyMuPDF (`page.get_text()`).
   - **Scanned PDFs:** Evaluated page-by-page. Pages with $< 30$ characters are selectively rendered at 200 DPI and processed through Tesseract OCR.
   - **Images (PNG, JPG, JPEG):** Orientation corrected with EXIF transpose, converted to high-contrast grayscale, and processed with Tesseract OCR.
2. **Deep Content & Format Validation:**
   - Strict **10 MB** file size ceiling enforced on frontend and backend.
   - Maximum **10-page** PDF ceiling (`MAX_PDF_PAGES = 10`) to prevent OCR timeouts.
   - Binary magic byte inspection (`%PDF-`, `\x89PNG`, `\xFF\xD8\xFF`) blocks disguised files.
3. **Zero-Retention Ephemeral Privacy:**
   - Temporary storage is strictly scoped to an `EphemeralDirectory` context manager.
   - Files are automatically deleted in a `finally` block before response completion.
   - PWA Workbox explicitly denylists `/api/*` from caching.
   - All `/api/*` responses carry `Cache-Control: no-store, no-cache, must-revalidate, private`.
   - Extracted text is stored exclusively in volatile React component state (never in `localStorage`).

---

## Render Deployment Guide (Tesseract OCR)

When deploying to [Render.com](https://render.com), Render's native Python environment does not include system Tesseract binaries by default, and non-root build steps cannot run `apt-get`.

**The recommended deployment path is Render Docker Web Service:**
1. Connect your repository to Render.
2. Select **Web Service** $\to$ **Docker**.
3. Set the Docker Context to root and the Dockerfile path to `backend/Dockerfile`.
4. Render will automatically build the container with Ubuntu, install `tesseract-ocr`, `tesseract-ocr-eng`, and launch via Gunicorn.
