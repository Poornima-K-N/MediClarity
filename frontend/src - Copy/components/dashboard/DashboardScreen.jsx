import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Header } from '../common/Header';
import { BottomNav } from '../common/BottomNav';
import { InstallBanner } from '../common/InstallBanner';
import { SignInModal } from '../common/SignInModal';
import { DemoDetailModal } from '../common/DemoDetailModal';
import { UploadZone } from './UploadZone';
import { RecentUploads } from './RecentUploads';
import { QuickTips } from './QuickTips';

export const DashboardScreen = () => {
  const { activeTab } = useAppState();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="app-container" role="main">
        {/* PWA Install Banner (shows only when supported by browser) */}
        <InstallBanner />

        {/* Tab view routing */}
        {activeTab === 'home' && (
          <>
            <UploadZone />
            <RecentUploads />
            <QuickTips />
          </>
        )}

        {activeTab === 'upload' && (
          <>
            <UploadZone />
            <QuickTips />
          </>
        )}

        {activeTab === 'history' && (
          <>
            <RecentUploads />
          </>
        )}

        {activeTab === 'tips' && (
          <>
            <QuickTips />
          </>
        )}
      </main>

      {/* Accessible Modals */}
      <SignInModal />
      <DemoDetailModal />

      {/* Mobile-First Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
