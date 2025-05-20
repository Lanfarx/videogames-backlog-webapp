import React, { useState } from "react";
import { useTheme } from "../contexts/theme-context";
import SettingsTabs from "../components/settings/SettingsTabs";
import ProfileSettings from "../components/settings/tabs/ProfileSettings";
import PrivacySettings from "../components/settings/tabs/PrivacySettings";
import GeneralSettings from "../components/settings/tabs/GeneralSettings";
import ConnectedAccountsSettings from "../components/settings/tabs/ConnectedAccountsSettings";

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("generali");

  const languageOptions = ["Italiano", "English"];
  const dateFormatOptions = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

  const [language, setLanguage] = useState(languageOptions[0] || "Italiano");
  const [dateFormat, setDateFormat] = useState(
    dateFormatOptions[0] || "DD/MM/YYYY",
  );

  // Stati e handler per privacy e account collegati
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const [privacyOptions, setPrivacyOptions] = useState({
    showPlaytime: true,
    showLibraryStats: true,
    allowFriendRequests: true,
  });
  const [notificationOptions, setNotificationOptions] = useState({
    emailNotifications: true,
    messageFromNonFollowers: false,
  });
  const [connectedAccounts, setConnectedAccounts] = useState({
    steam: "",
  });

  const handleProfileVisibilityChange = (isPublic: boolean) => {
    setIsProfilePublic(isPublic);
  };

  const handlePrivacyOptionChange = (option: string, value: boolean) => {
    setPrivacyOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleNotificationOptionChange = (option: string, value: boolean) => {
    setNotificationOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleConnectedAccountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setConnectedAccounts((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccountDisconnect = (platform: string) => {
    setConnectedAccounts((prev) => ({
      ...prev,
      [platform]: "",
    }));
  };

  const { theme, accentColor, setTheme, setAccentColor } = useTheme();

  // Definizione dei colori di accento
  const accentColors: Record<string, string> = {
    arancione: "bg-orange-500",
    blu: "bg-blue-500",
    verde: "bg-green-500",
    rosso: "bg-red-500",
    viola: "bg-purple-500",
  };

  const handleDeleteAllData = () => {
    console.log("Eliminazione di tutti i dati...");
  };

  return (
    <div className="flex flex-col bg-secondaryBg min-h-screen">
      <div className="container mx-auto max-w-4xl p-6">
        <h1 className="font-montserrat font-bold text-2xl text-text-primary mb-4">
          Impostazioni
        </h1>
        <hr className="border-t border-border-color my-4" />

        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "generali" && (
          <GeneralSettings
            language={language}
            dateFormat={dateFormat}
            languageOptions={languageOptions}
            dateFormatOptions={dateFormatOptions}
            onLanguageChange={setLanguage}
            onDateFormatChange={setDateFormat}
            theme={theme}
            accentColor={accentColor}
            setTheme={setTheme}
            setAccentColor={setAccentColor}
            accentColors={accentColors}
          />
        )}

        {activeTab === "profilo" && <ProfileSettings />}
        {activeTab === "privacy" && (
          <PrivacySettings
            isProfilePublic={isProfilePublic}
            privacyOptions={privacyOptions}
            notificationOptions={notificationOptions}
            onProfileVisibilityChange={handleProfileVisibilityChange}
            onPrivacyOptionChange={handlePrivacyOptionChange}
            onNotificationOptionChange={handleNotificationOptionChange}
          />
        )}
        {activeTab === "account-collegati" && (
          <ConnectedAccountsSettings
            connectedAccounts={connectedAccounts}
            onConnectedAccountChange={handleConnectedAccountChange}
            onAccountDisconnect={handleAccountDisconnect}
          />
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
