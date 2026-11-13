# MediClarity AI — Medical Report & Prescription Assistant

MediClarity AI is an installable, mobile-friendly Progressive Web App (PWA) designed to help patients and caregivers understand laboratory reports, diagnostics, and prescriptions in plain language.

---

## Architecture Overview

- **Module 1 (Completed):** Project Setup, Responsive UI Foundation, and PWA Architecture (React + Vite + CSS).
- **Module 2 (Upcoming):** Document Processing, OCR, and AI Analysis Engine (Python Flask Backend).

```
MediClarity/
├── frontend/                     # React + Vite PWA Application
│   ├── public/                   # PWA Manifest icons, Favicon, Brand SVGs
│   ├── src/
│   │   ├── components/           # Splash, Welcome, Dashboard, Common Modals & Nav
│   │   ├── context/              # AppStateContext (Navigation & UI simulation)
│   │   ├── styles/               # Design Tokens, Globals, and Component styling
│   │   ├── App.jsx               # Screen orchestrator
│   │   └── main.jsx              # Application bootstrap
│   ├── vite.config.js            # Vite build configuration + VitePWA plugin
│   └── package.json
├── backend/                      # Reserved for upcoming Flask Module
└── README.md
```

---

## Getting Started (Module 1 Development)

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Run

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite local development server
npm run dev

# Build for production & PWA validation
npm run build
```

---

## Implemented Features in Module 1

1. **Splash Screen:** Branded entry with medical cross & ECG animation, 3.5s auto-transition, and quick-skip control.
2. **Welcome Screen:** Educational benefits overview, value propositions, "Continue as Guest" one-click onboarding, and accessible "Sign In" preview modal.
3. **Patient Dashboard:**
   - Responsive layout (mobile-first thumb navigation + desktop header).
   - Interactive document dropzone (UI preview with format indicators for PDF, PNG, JPG).
   - Synthetic demo cards for CBC and Lipid Panel (clearly badged as non-clinical synthetic demo data).
   - Document scanning tips and medical disclaimers.
4. **PWA Integration:**
   - Manifest configuration with clinical teal theme.
   - PWA icons (192px, 512px, maskable, iOS touch icon).
   - Browser install prompt listener (displays install button only when supported).
