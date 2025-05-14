import React, { useState } from 'react';
import { Sun, Moon, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/theme-context';
import Dropdown from '../components/ui/atoms/Dropdown';
import SettingsTabs from '../components/settings/SettingsTabs';
import SettingsSection from '../components/settings/SettingsSection';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('generali');
  
  const languageOptions = ['Italiano', 'English'];
  const dateFormatOptions = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  
  const [language, setLanguage] = useState(languageOptions[0] || 'Italiano');
  const [dateFormat, setDateFormat] = useState(dateFormatOptions[0] || 'DD/MM/YYYY');
  
  const { theme, setTheme } = useTheme();

  const handleSaveChanges = () => {
    console.log('Salvataggio modifiche...');
  };

  const handleResetSettings = () => {
    console.log('Ripristino impostazioni predefinite...');
  };

  const handleDeleteAllData = () => {
    console.log('Eliminazione di tutti i dati...');
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="font-montserrat font-bold text-2xl text-text-primary mb-4">Impostazioni</h1>
      <hr className="border-t border-border-color my-4" />

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'generali' && (
        <>
          <section className="mb-8">
            <h2 className="font-montserrat font-semibold text-xl text-text-primary mb-4">Tema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className={`flex flex-col items-center justify-center p-6 rounded-lg border ${
                  theme === 'light' ? 'border-accent-primary bg-accent-primary/10' : 'border-border-color bg-secondary-bg'
                } hover:border-accent-primary transition-all`}
                onClick={() => setTheme('light')}
              >
                <Sun className={`w-8 h-8 mb-2 ${theme === 'light' ? 'text-accent-primary' : 'text-text-secondary'}`} />
                <span className={`font-roboto font-medium ${theme === 'light' ? 'text-accent-primary' : 'text-text-primary'}`}>Chiaro</span>
              </button>

              <button
                className={`flex flex-col items-center justify-center p-6 rounded-lg border ${
                  theme === 'dark' ? 'border-accent-primary bg-accent-primary/10' : 'border-border-color bg-secondary-bg'
                } hover:border-accent-primary transition-all`}
                onClick={() => setTheme('dark')}
              >
                <Moon className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-accent-primary' : 'text-text-secondary'}`} />
                <span className={`font-roboto font-medium ${theme === 'dark' ? 'text-accent-primary' : 'text-text-primary'}`}>Scuro</span>
              </button>
            </div>
          </section>

          <SettingsSection title="Lingua e Regione">
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
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                className="flex items-center px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
                onClick={handleSaveChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                Salva modifiche
              </button>

              <button
                className="flex items-center px-4 py-2 bg-secondary-bg text-text-primary border border-border-color font-roboto font-medium text-sm rounded-lg hover:bg-tertiary-bg transition-colors"
                onClick={handleResetSettings}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Ripristina predefiniti
              </button>

              <button
                className="flex items-center px-4 py-2 bg-accent-danger text-white font-roboto font-medium text-sm rounded-lg hover:bg-accent-danger/90 transition-colors ml-auto"
                onClick={handleDeleteAllData}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Elimina tutti i dati
              </button>
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
  );
};

export default SettingsPage;