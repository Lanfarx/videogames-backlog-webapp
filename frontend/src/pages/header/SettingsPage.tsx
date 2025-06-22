import React, { useState, useEffect } from "react";
import SettingsTabs from "../../components/settings/SettingsTabs";
import ProfileSettings from "../../components/settings/tabs/ProfileSettings";
import PrivacySettings from "../../components/settings/tabs/PrivacySettings";
import ConnectedAccountsSettings from "../../components/settings/tabs/ConnectedAccountsSettings";
import GeneralSettings from "../../components/settings/tabs/GeneralSettings";

const SettingsPage: React.FC = () => {
  // Carica la tab attiva dal localStorage, default a "generali"
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('settingsActiveTab') || "generali";
  });

  // Salva la tab attiva nel localStorage ogni volta che cambia
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    localStorage.setItem('settingsActiveTab', newTab);
  };

  return (
    <div className="flex flex-col bg-secondary-bg min-h-screen">
      <div className="container mx-auto max-w-4xl p-6">
        <h1 className="font-montserrat font-bold text-2xl text-text-primary mb-4">
          Impostazioni
        </h1>
        <hr className="border-t border-border-color my-4" />

        <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />        {activeTab === "generali" && (
          <GeneralSettings/>
        )}

        {activeTab === "profilo" && <ProfileSettings />}
        {activeTab === "privacy" && (
          <PrivacySettings/>
        )}
        {activeTab === "account-collegati" && (
          <ConnectedAccountsSettings/>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
