"use client"

import React from 'react';

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs = [
    { id: "generali", label: "Generali" },
    { id: "profilo", label: "Profilo" },
    { id: "privacy", label: "Privacy" },
    { id: "account-collegati", label: "Account Collegati" },
  ]

  return (
    <div className="bg-primaryBg rounded-lg border border-border-color shadow-sm overflow-x-auto mb-6">
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 font-secondary font-medium text-base transition-colors ${
              activeTab === tab.id
                ? "text-white bg-accent-primary"
                : "text-text-secondary hover:text-text-primary hover:bg-tertiaryBg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
