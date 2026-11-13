# MediClarity AI — Medical Report & Prescription Assistant

MediClarity AI is an installable, mobile-friendly Progressive Web App (PWA) designed to help patients and caregivers understand laboratory reports, diagnostics, and prescriptions in plain language.

---

## Architecture Overview

- **Module 1 (Completed):** Project Setup, Responsive UI Foundation, and PWA Architecture (React + Vite + CSS).
- **Module 2 (Completed):** Document Upload & Text Extraction (PyMuPDF Digital Parsing + Tesseract OCR Fallback + Ephemeral Privacy Processing + Flask API).
- **Module 3 (Completed):** Gemini AI Integration (Structured Fact Extraction: Test Names, Values, Units, Lab Reference Ranges, Explicit Abnormal Flags, Medications & Dosages).
- **Module 4 (Completed):** Plain-Language Medical Explanations (Comparing Observed Test Values Against Reference Ranges + Medical Term Clarification + Patient Questions for Doctors + Non-Diagnostic Guardrails).
- **Module 5 (Completed):** Grounded Document Q&A / "Ask Your Report" (Conversational Chat Interface + Strictly Document-Grounded Answers + Quoted Evidence Badges + Missing-Data Disclaimers).

```
MediClarity/
├── frontend/                     # React + Vite PWA Application
│   ├── public/                   # PWA Manifest icons, Favicon, Brand SVGs
│   ├── src/
│   │   ├── components/           # Splash, Welcome, Dashboard, ExtractionPreview, StructuredMedicalDashboard, MedicalExplanations, AskYourReport
│   │   ├── context/              # AppStateContext (Navigation & volatile extraction store)
│   │   ├── services/             # Client API service (/api/process-document, /api/analyze-medical-text, /api/explain-medical-report, /api/ask-document)
│   │   ├── styles/               # Design Tokens, Globals, and Component styling
│   │   ├── App.jsx               # Screen orchestrator
│   │   └── main.jsx              # Application bootstrap
│   ├── vite.config.js            # Vite build configuration + PWA + /api proxy
│   └── package.json
│
├── backend/                      # Python Flask Backend
│   ├── app/
│   │   ├── routes/               # POST /api/process-document, /api/analyze-medical-text, /api/explain-medical-report, /api/ask-document
│   │   ├── services/             # validator.py, cleaner.py, extractor.py, gemini_service.py
│   │   ├── config.py             # 10MB limit, 10-page ceiling, GEMINI_API_KEY
│   │   └── __init__.py           # Flask factory with zero-cache security headers
│   ├── tests/                    # Synthetic non-clinical fixtures, test_extraction.py, test_gemini.py, test_modules_4_5.py
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
- Google Gemini API Key (`GEMINI_API_KEY`)

---

### 1. Configure Backend Environment & Run

Create a `.env` file in `backend/` or project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
```

```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Run the test suite (19 unit & integration tests)
python -m unittest discover -s backend/tests -p "test_*.py"

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

## Module 3 Gemini AI Extraction Highlights

1. **Factual Grounding & Hallucination Guardrails:**
   - Strict system prompt instructs Gemini to extract ONLY facts explicitly printed in the report text.
   - Reference ranges and normal limits are NEVER inferred, estimated, or looked up from medical textbooks if absent. If unstated, they remain `null` and display *"Not provided in report"*.
   - Abnormal flags (`High`, `Low`, `Abnormal`, `Borderline`) are assigned ONLY when explicitly stated or attached to a result marker (e.g., `*`, `H`, `L`, `HIGH`, `LOW`, `ABNORMAL`) in the original text.
   - Prescriptions extract drug names, dosage strengths, forms, frequencies, directions, and refill counts without guessing.
2. **Clinical Safety:**
   - Strictly non-diagnostic: No clinical diagnoses, disease assessments, or treatment recommendations are produced.
   - Persistent educational disclaimer displayed on the structured dashboard.
3. **Graceful Key & Error Handling:**
   - If `GEMINI_API_KEY` is not configured, the application returns HTTP 503 with a friendly configuration card instructing how to set it, without crashing or failing document extraction.
   - Extracted text from Module 2 is always immediately available regardless of Gemini status.
4. **Zero-Retention Ephemeral Privacy:**
   - API key resides exclusively in backend environment variables.
   - Extracted text and structured results exist exclusively in volatile frontend component memory (never in `localStorage`).

---

## Module 4 & 5 Highlights: Plain-English Explanations & Report Q&A

1. **Module 4: Plain-Language Medical Explanations (`POST /api/explain-medical-report`):**
   - Translates dense lab metrics and prescription terminology into clear, accessible patient-facing language.
   - Distinctly presents both the exact report observation (comparing value vs stated reference range) and the educational explanation of what that metric measures.
   - Auto-generates proactive, context-specific questions for patients to ask their healthcare provider.
   - Non-diagnostic guardrail: Never renders diagnostic verdicts, prognoses, or treatment advice.

2. **Module 5: Strictly Grounded Report Q&A (`POST /api/ask-document`):**
   - Interactive conversational chat interface anchored strictly to the uploaded document text.
   - Every factual answer provides exact quoted evidence from the report text.
   - Hallucination safeguard: If a user asks about an unmentioned condition, biomarker, or drug, Gemini explicitly states that the requested information is not present in the document.
   - Quick-action suggestion chips for rapid inquiry ("Are any test values high/low?", "What medications are listed?").

---

## Render Deployment Guide (Tesseract OCR + Gemini)

When deploying to [Render.com](https://render.com), use the **Docker Web Service** configuration:
1. Connect repository to Render.
2. Select **Web Service** $\to$ **Docker**.
3. Set the Docker Context to root and the Dockerfile path to `backend/Dockerfile`.
4. Add the environment variable `GEMINI_API_KEY` under the Render Environment tab.
5. Render builds the container with Ubuntu, installs `tesseract-ocr`, `tesseract-ocr-eng`, installs `requirements.txt`, and launches via Gunicorn.
