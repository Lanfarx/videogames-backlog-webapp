import React, { useState } from 'react';
import { useTheme } from '../contexts/theme-context';

// Import components UI generici
import Button from '../components/ui/atoms/Button';
import Dropdown from '../components/ui/atoms/Dropdown';
import ToggleSwitch from '../components/settings/ToggleSwitch';

// Import componenti specifici delle impostazioni
import ColorSelector from '../components/settings/ColorSelector';
import SettingsSection from '../components/settings/SettingsSection';
import SettingsTabs from '../components/settings/SettingsTabs';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generali');
  
  // Assicurati che questi array siano definiti correttamente
  const languageOptions = ['Italiano', 'English'];
  const dateFormatOptions = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  
  // Inizializza gli stati con valori predefiniti sicuri
  const [language, setLanguage] = useState(languageOptions[0] || 'Italiano');
  const [dateFormat, setDateFormat] = useState(dateFormatOptions[0] || 'DD/MM/YYYY');
  
  // Utilizzo del hook useTheme
  const { theme, setTheme } = useTheme();
  
  // Converti lo stato del tema in un valore booleano per il ToggleSwitch
  const isDarkMode = theme === 'dark';
  
  // Gestisci il cambio del tema
  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleExportData = () => {
    console.log('Esportazione dati...');
    // Logica per l'esportazione dei dati
  };

  const handleImportData = () => {
    console.log('Importazione dati...');
    // Logica per l'importazione dei dati
  };

  return (
    <div className="mx-auto px-6 bg-secondaryBg min-h-screen py-6">
      {/* Titolo della sezione */}
      <div className="bg-primary-bg  border border-border-color rounded-lg shadow-sm mb-6">
      <div className="p-6">
        <h1 className="font-primary font-bold text-2xl text-text-primary">Impostazioni</h1>
      </div>
      </div>

      {/* Tab di navigazione */}
      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenuto principale delle impostazioni */}
      <div className="bg-primaryBg border border-border-color rounded-md p-6">
        {activeTab === 'generali' && (
          <>
            <SettingsSection title="Tema dell'applicazione">
              <div className="flex items-center justify-between py-4">
                <span className="font-secondary text-base text-text-secondary">Modalità scura</span>
                <ToggleSwitch checked={isDarkMode} onChange={handleThemeChange} />
              </div>
              <ColorSelector />
            </SettingsSection>

            <SettingsSection title="Lingua e Regione">
              {/* Assicurati che le props siano valide prima di renderizzare */}
              {languageOptions && languageOptions.length > 0 && (
                <Dropdown 
                  label="Lingua" 
                  options={languageOptions} 
                  selected={language} 
                  onChange={setLanguage} 
                />
              )}
              
              {dateFormatOptions && dateFormatOptions.length > 0 && (
                <Dropdown 
                  label="Formato data" 
                  options={dateFormatOptions} 
                  selected={dateFormat} 
                  onChange={setDateFormat} 
                />
              )}
            </SettingsSection>

            <SettingsSection title="Dati e Backup">
              <div className="flex space-x-4 pt-2">
                <Button label="Esporta Dati" primary={true} onClick={handleExportData} />
                <Button label="Importa Dati" primary={false} onClick={handleImportData} />
              </div>
            </SettingsSection>
          </>
        )}

        {activeTab === 'profilo' && (
          <div className="py-10 text-center text-text-secondary">
            Contenuto della sezione Profilo
          </div>
        )}
        {activeTab === 'privacy' && (
          <div className="py-10 text-center text-text-secondary">
            Contenuto della sezione Privacy
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;