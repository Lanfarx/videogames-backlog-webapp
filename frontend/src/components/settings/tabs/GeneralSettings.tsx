import React from 'react';
import { Globe, Palette, Sun, Moon } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ColorSelector from '../ColorSelector';
import { getCssVarColor } from '../../../utils/getCssVarColor';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setUserProfile } from '../../../store/slice/userSlice';
import { updateProfile } from '../../../store/services/profileService';

const languageOptions = ['It', 'En'];
const dateFormatOptions = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

const GeneralSettings: React.FC = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.user.profile);

  if (!userProfile) return <div>Caricamento...</div>;

  const preferences = userProfile.appPreferences || {};
  const theme = preferences.theme || 'light';
  const language = preferences.language || 'it';
  const dateFormat = preferences.dateFormat || 'DD/MM/YYYY';
  const accentColor = preferences.accentColor || 'arancione';

  // Helper per update e dispatch
  const handleProfileUpdate = async (newPrefs: Partial<typeof preferences>) => {
    const newProfile = {
      ...userProfile,
      appPreferences: {
        ...preferences,
        ...newPrefs
      }
    };
    const updated = await updateProfile(newProfile);
    dispatch(setUserProfile(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-semibold text-xl text-text-primary">Impostazioni generali</h2>
      </div>
      
      {/* Sezione Tema */}
      <SettingsSection title="Tema e aspetto">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary mb-4">
            Personalizza l'aspetto dell'applicazione secondo le tue preferenze.
          </p>
          
          <section className="mb-6">
            <h3 className="font-montserrat font-medium text-lg text-text-primary mb-4">Tema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className={`flex flex-col items-center justify-center p-6 rounded-lg border ${
                  theme === 'light' ? 'border-accent-primary bg-accent-primary/10' : 'border-border-color bg-secondary-bg'
                } hover:border-accent-primary transition-all`}
                onClick={() => handleProfileUpdate({ theme: 'light' })}
              >
                <Sun className={`w-8 h-8 mb-2 ${theme === 'light' ? 'text-accent-primary' : 'text-text-secondary'}`} />
                <span className={`font-roboto font-medium ${theme === 'light' ? 'text-accent-primary' : 'text-text-primary'}`}>Chiaro</span>
              </button>

              <button
                className={`flex flex-col items-center justify-center p-6 rounded-lg border ${
                  theme === 'dark' ? 'border-accent-primary bg-accent-primary/10' : 'border-border-color bg-secondary-bg'
                } hover:border-accent-primary transition-all`}
                onClick={() => handleProfileUpdate({ theme: 'dark' })}
              >
                <Moon className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-accent-primary' : 'text-text-secondary'}`} />
                <span className={`font-roboto font-medium ${theme === 'dark' ? 'text-accent-primary' : 'text-text-primary'}`}>Scuro</span>
              </button>
            </div>
          </section>

          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: getCssVarColor(`--accent-primary`, '#FB7E00') }}
                ></div>
                <div>
                  <p className="text-text-primary">Colore accento</p>
                  <p className="text-xs text-text-secondary">Seleziona il colore principale dell'interfaccia</p>
                </div>
              </div>
              <ColorSelector 
                accentColor={accentColor}
                onChange={(color) => handleProfileUpdate({ accentColor: color })}
              />
            </div>
          </div>
        </div>
      </SettingsSection>
      
      {/* Sezione Lingua */}
      <SettingsSection title="Impostazioni lingua">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary mb-4">
            Scegli la lingua e il formato data preferito.
          </p>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-text-primary">Lingua</p>
                <p className="text-xs text-text-secondary">Seleziona la lingua preferita per l'applicazione</p>
              </div>
            </div>
            <select 
              className="px-3 py-2 border border-border-color rounded-lg bg-primaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              value={language}
              onChange={(e) => handleProfileUpdate({ language: e.target.value })}
            >
              {languageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Palette className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-text-primary">Formato data</p>
                <p className="text-xs text-text-secondary">Seleziona il formato data preferito</p>
              </div>
            </div>
            <select 
              className="px-3 py-2 border border-border-color rounded-lg bg-primaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
              value={dateFormat}
              onChange={(e) => handleProfileUpdate({ dateFormat: e.target.value })}
            >
              {dateFormatOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};

export default GeneralSettings;