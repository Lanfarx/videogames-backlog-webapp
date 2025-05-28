import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/theme-context";
import SettingsTabs from "../../components/settings/SettingsTabs";
import ProfileSettings from "../../components/settings/tabs/ProfileSettings";
import PrivacySettings from "../../components/settings/tabs/PrivacySettings";
import ConnectedAccountsSettings from "../../components/settings/tabs/ConnectedAccountsSettings";
import GeneralSettings from "../../components/settings/tabs/GeneralSettings";
import { saveToLocal, loadFromLocal } from '../../utils/localStorage';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("generali");

  const languageOptions = ["Italiano", "English"];
  const dateFormatOptions = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

  const [language, setLanguage] = useState(languageOptions[0] || "Italiano");
  const [dateFormat, setDateFormat] = useState(
    dateFormatOptions[0] || "DD/MM/YYYY",
  );

  // Stati e handler per privacy e account collegati
  const [isProfilePublic, setIsProfilePublic] = useState(() => {
    const savedValue = loadFromLocal('isProfilePublic');
    return savedValue ? savedValue : false;
  });
  
  const [privacyOptions, setPrivacyOptions] = useState(() => {
    const savedOptions = loadFromLocal('privacyOptions');
    return savedOptions ? savedOptions : {
      showStats: true,
      showDiary: true,
      allowFriendRequests: true,
    };
  });
  
  const [notificationOptions, setNotificationOptions] = useState(() => {
    const savedOptions = loadFromLocal('notificationOptions');
    return savedOptions ? savedOptions : {
      emailNotifications: true
    };
  });
  
  const [connectedAccounts, setConnectedAccounts] = useState(() => {
    const savedAccounts = loadFromLocal('connectedAccounts');
    return savedAccounts ? savedAccounts : {
      steam: "",
    };
  });

  const handleProfileVisibilityChange = (isPublic: boolean) => {
    setIsProfilePublic(isPublic);
    saveToLocal('isProfilePublic', isPublic);
  };

  const handlePrivacyOptionChange = (option: string, value: boolean) => {
    setPrivacyOptions((prev: any) => {
      const newOptions = {
        ...prev,
        [option]: value,
      };
      saveToLocal('privacyOptions', newOptions);
      return newOptions;
    });
  };

  const handleNotificationOptionChange = (option: string, value: boolean) => {
    setNotificationOptions((prev: any) => {
      const newOptions = {
        ...prev,
        [option]: value,
      };
      saveToLocal('notificationOptions', newOptions);
      return newOptions;
    });
  };

  const handleConnectedAccountChange = (
    platform: string,
    value: string
  ) => {
    setConnectedAccounts((prev: any) => {
      const newAccounts = {
        ...prev,
        [platform]: value,
      };
      saveToLocal('connectedAccounts', newAccounts);
      return newAccounts;
    });
  };

  const handleAccountDisconnect = (platform: string) => {
    setConnectedAccounts((prev: any) => {
      const newAccounts = {
        ...prev,
        [platform]: "",
      };
      saveToLocal('connectedAccounts', newAccounts);
      return newAccounts;
    });
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

        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />        {activeTab === "generali" && (
          <GeneralSettings
            language={language}
            dateFormat={dateFormat}
            theme={theme}
            accentColor={accentColor}
            accentColors={accentColors}
            languageOptions={languageOptions}
            dateFormatOptions={dateFormatOptions}
            onLanguageChange={setLanguage}
            onDateFormatChange={setDateFormat}
            setTheme={setTheme}
            setAccentColor={setAccentColor}
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
