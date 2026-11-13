import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Home, UploadCloud, FileText, HelpCircle } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab } = useAppState();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'history', label: 'Reports', icon: FileText },
    { id: 'tips', label: 'Tips', icon: HelpCircle },
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
