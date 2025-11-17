import React from 'react';
import { Users, Clipboard, Target } from 'lucide-react';

export type TabletTab = 'lineup' | 'bench' | 'set-pieces';

interface TabletNavigationProps {
  activeTab: TabletTab;
  onTabChange: (tab: TabletTab) => void;
}

export default function TabletNavigation({ activeTab, onTabChange }: TabletNavigationProps) {
  const tabs: { id: TabletTab; label: string; icon: React.ReactNode }[] = [
    { id: 'lineup', label: 'Lineup', icon: <Users size={24} /> },
    { id: 'bench', label: 'Bench', icon: <Clipboard size={24} /> },
    { id: 'set-pieces', label: 'Set Pieces', icon: <Target size={24} /> },
  ];

  return (
    <div className="tablet-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tablet-nav-tab ${activeTab === tab.id ? 'tablet-nav-tab-active' : ''
            }`}
          aria-label={tab.label}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          <div className="flex items-center justify-center gap-2">
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
