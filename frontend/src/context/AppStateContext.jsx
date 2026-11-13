import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext(null);

export const AppStateProvider = ({ children }) => {
  // Screen routing: 'splash' -> 'welcome' -> 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [activeTab, setActiveTab] = useState('home');
  
  // Modals
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

  // UI-only uploaded files list
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
      summaryNote: 'Demonstration report: In Module 2, the AI analysis engine will parse patient CBC results into simplified explanations.',
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
      summaryNote: 'Demonstration report: In Module 2, the AI analysis engine will highlight dietary and lifestyle takeaways in patient-friendly terms.',
    },
  ];

  // Capture PWA beforeinstallprompt event (Show prompt ONLY when supported)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      // Stash event so it can be triggered by UI button
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

  // UI-only file simulation handler
  const handleSimulatedFileUpload = (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList).map((f) => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: f.type || 'Document',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Uploaded (UI Preview)',
      isSynthetic: true,
    }));

    setUploadedFiles((prev) => [...newFiles, ...prev]);
    setUploadToast(`Simulated upload of "${newFiles[0].name}". Real processing arrives in Module 2.`);

    setTimeout(() => {
      setUploadToast(null);
    }, 4500);
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
        handleSimulatedFileUpload,
        uploadToast,
        setUploadToast,
        isInstallable,
        triggerInstallPrompt,
        dismissInstallPrompt,
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
