import React, { createContext, useContext, useState, useEffect } from 'react';
import { uploadAndProcessDocument, analyzeMedicalText, fetchHealthCheck } from '../services/api';

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  // Screen routing: 'splash' -> 'welcome' -> 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [activeTab, setActiveTab] = useState('home');
  
  // Modals & feedback
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [selectedDemoReport, setSelectedDemoReport] = useState(null);
  const [uploadToast, setUploadToast] = useState(null);

  // Guest Session info
  const [userState, setUserState] = useState({
    isAuthenticated: false,
    isGuest: true,
    displayName: 'Guest Patient',
  });

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Document Extraction State (Volatile memory only - zero persistent storage)
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeUploadName, setActiveUploadName] = useState(null);
  const [extractionResult, setExtractionResult] = useState(null);
  const [extractionError, setExtractionError] = useState(null);

  // Module 3: Gemini AI Structured Extraction State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiStructuredData, setAiStructuredData] = useState(null);
  const [aiAnalysisError, setAiAnalysisError] = useState(null);
  const [isAiKeyMissing, setIsAiKeyMissing] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);

  // Processed session files list (displayed in Recent Uploads)
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Synthetic demo data (clearly labelled demo data)
  const syntheticReports = [
    {
      id: 'demo-cbc-01',
      title: 'Complete Blood Count (CBC) Panel',
      date: 'Synthetic Demo Record',
      category: 'Hematology',
      isSynthetic: true,
      parameters: [
        { name: 'Hemoglobin', value: '14.2 g/dL', status: 'Normal' },
        { name: 'WBC Count', value: '6,800 /mcL', status: 'Normal' },
        { name: 'Platelets', value: '240,000 /mcL', status: 'Normal' },
      ],
      summaryNote: 'Demonstration report: In Module 3, Gemini AI extracts structured lab values and explicit flags with zero hallucination.',
    },
    {
      id: 'demo-lipid-02',
      title: 'Lipid Profile & Cholesterol Panel',
      date: 'Synthetic Demo Record',
      category: 'Biochemistry',
      isSynthetic: true,
      parameters: [
        { name: 'Total Cholesterol', value: '188 mg/dL', status: 'Desirable' },
        { name: 'HDL (Good)', value: '52 mg/dL', status: 'Optimal' },
        { name: 'LDL (Bad)', value: '110 mg/dL', status: 'Borderline' },
        { name: 'Triglycerides', value: '130 mg/dL', status: 'Normal' },
      ],
      summaryNote: 'Demonstration report: In Module 3, Gemini AI extracts structured lab values and explicit flags with zero hallucination.',
    },
  ];

  // Check backend health & Gemini status on startup
  useEffect(() => {
    fetchHealthCheck().then((res) => {
      if (res && res.gemini_configured) {
        setGeminiConfigured(true);
      }
    });
  }, []);

  // Capture PWA beforeinstallprompt event (Show prompt ONLY when supported)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstallPrompt = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const dismissInstallPrompt = () => {
    setIsInstallable(false);
  };

  // Document upload and extraction handler (Module 2)
  const processRealFileUpload = async (file) => {
    if (!file) return;

    setIsExtracting(true);
    setExtractionError(null);
    clearAIAnalysis();
    setActiveUploadName(file.name);

    try {
      const data = await uploadAndProcessDocument(file);
      setExtractionResult(data);

      if (data.gemini_configured) {
        setGeminiConfigured(true);
      }

      // Add to session document list
      const sessionFile = {
        name: data.filename || file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: data.file_type?.toUpperCase() || 'DOCUMENT',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: `Extracted (${data.extraction_method?.replace('_', ' ')})`,
        method: data.extraction_method,
        isSynthetic: false,
      };

      setUploadedFiles((prev) => [sessionFile, ...prev]);
      setUploadToast(`Extracted ${data.word_count} words from ${file.name}.`);

      setTimeout(() => {
        setUploadToast(null);
      }, 5000);
    } catch (err) {
      console.error('[Document Extraction Error]:', err);
      setExtractionError(err.message || 'Failed to extract text from document.');
    } finally {
      setIsExtracting(false);
      setActiveUploadName(null);
    }
  };

  // Module 3: Trigger Gemini AI Structured Information Extraction
  const triggerGeminiAnalysis = async (overrideText = null, overrideFilename = null) => {
    const textToAnalyze = overrideText || extractionResult?.extracted_text;
    const filename = overrideFilename || extractionResult?.filename || 'document';

    if (!textToAnalyze || !textToAnalyze.trim()) {
      setAiAnalysisError('No document text is available to extract information from.');
      return;
    }

    setIsAnalyzingAI(true);
    setAiAnalysisError(null);
    setIsAiKeyMissing(false);

    try {
      const structuredData = await analyzeMedicalText(textToAnalyze, filename);
      setAiStructuredData(structuredData);
      setUploadToast('Extracted structured medical information with Gemini AI.');

      setTimeout(() => {
        setUploadToast(null);
      }, 4000);
    } catch (err) {
      console.error('[Gemini Analysis Error]:', err);
      setAiAnalysisError(err.message || 'Failed to analyze document with Gemini API.');
      if (err.missingKey || err.status === 503) {
        setIsAiKeyMissing(true);
      }
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const clearAIAnalysis = () => {
    setAiStructuredData(null);
    setAiAnalysisError(null);
    setIsAiKeyMissing(false);
  };

  const clearExtraction = () => {
    setExtractionResult(null);
    setExtractionError(null);
    setActiveUploadName(null);
    clearAIAnalysis();
  };

  return (
    <AppStateContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        isSignInModalOpen,
        setIsSignInModalOpen,
        selectedDemoReport,
        setSelectedDemoReport,
        userState,
        setUserState,
        syntheticReports,
        uploadedFiles,
        uploadToast,
        setUploadToast,
        isInstallable,
        triggerInstallPrompt,
        dismissInstallPrompt,
        // Module 2 Document Extraction
        isExtracting,
        activeUploadName,
        extractionResult,
        extractionError,
        processRealFileUpload,
        clearExtraction,
        // Module 3 Gemini AI Extraction
        isAnalyzingAI,
        aiStructuredData,
        aiAnalysisError,
        isAiKeyMissing,
        geminiConfigured,
        triggerGeminiAnalysis,
        clearAIAnalysis,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
