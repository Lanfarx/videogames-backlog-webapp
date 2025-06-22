import React from 'react';
import { Globe, Lock, BookOpen, BarChart2, UserPlus, Mail } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { setUserProfile } from '../../../store/slice/userSlice';
import { updateProfile } from '../../../store/services/profileService';

const PrivacySettings: React.FC = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.user.profile);

  if (!userProfile) return <div>Caricamento...</div>;

  // Helper per update e dispatch
  const handleProfileUpdate = async (newProfile: typeof userProfile) => {
    const updated = await updateProfile(newProfile);
    dispatch(setUserProfile(updated));
  };

  // Cambia visibilità profilo
  const handleProfileVisibilityChange = async (IsPublic: boolean) => {
    const newProfile = {
      ...userProfile,
      privacySettings: {
        ...userProfile.privacySettings,
        isPrivate: !IsPublic
      }
    };
    await handleProfileUpdate(newProfile);
  };
  // Cambia opzioni privacy
  const handlePrivacyOptionChange = async (option: string, value: boolean) => {
    const newProfile = {
      ...userProfile,
      privacySettings: {
        ...userProfile.privacySettings,
        [option]: value
      }
    };
    await handleProfileUpdate(newProfile);
  };

  // Cambia opzioni notifica
  const handleNotificationOptionChange = async (option: string, value: boolean) => {
    const newProfile = {
      ...userProfile,
      appPreferences: {
        ...userProfile.appPreferences,
        [option]: value
      }
    };
    await handleProfileUpdate(newProfile);
  };

  const isProfilePublic = !userProfile.privacySettings?.isPrivate;
  const privacyOptions = {
    showStats: userProfile.privacySettings?.showStats ?? false,
    showDiary: userProfile.privacySettings?.showDiary ?? false,
    allowFriendRequests: userProfile.privacySettings?.friendRequests ?? false,
  };
  const notificationOptions = {
    emailNotifications: userProfile.appPreferences?.notifications ?? false,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-semibold text-xl text-text-primary">Impostazioni privacy</h2>
      </div>
      {/* Sezione Visibilità Profilo */}
      <SettingsSection title="Visibilità del profilo">
        <div className="flex items-center justify-between bg-tertiary-bg p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-3">
            {isProfilePublic ? (
              <Globe className="w-5 h-5 text-accent-success" />
            ) : (
              <Lock className="w-5 h-5 text-text-secondary" />
            )}
            <div>
              <h3 className="font-medium text-text-primary">
                {isProfilePublic ? 'Profilo pubblico' : 'Profilo privato'}
              </h3>              <p className="text-sm text-text-secondary">
                {isProfilePublic 
                  ? 'Il tuo profilo e le tue statistiche sono visibili agli altri utenti' 
                  : 'Solo tu e i tuoi amici potete vedere le tue statistiche'}
              </p>
            </div>
          </div>
          <ToggleSwitch 
            checked={isProfilePublic} 
            onChange={v => handleProfileVisibilityChange(v)}
          />
        </div>
        {/* Opzioni di privacy aggiuntive */}
        {isProfilePublic && (
          <div className="space-y-3 mt-4">
            <h4 className="font-medium text-sm text-text-secondary mb-2">Opzioni di privacy aggiuntive</h4>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <BarChart2 className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-text-primary">Mostra statistiche generali</p>
                  <p className="text-xs text-text-secondary">Consenti agli altri utenti di vedere i tuoi progressi e statistiche di gioco</p>
                </div>
              </div>
              <ToggleSwitch 
                checked={privacyOptions.showStats} 
                onChange={v => handlePrivacyOptionChange('showStats', v)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-text-primary">Mostra diario di gioco</p>
                  <p className="text-xs text-text-secondary">Consenti agli altri utenti di vedere il tuo diario di gioco</p>
                </div>
              </div>
              <ToggleSwitch 
                checked={privacyOptions.showDiary} 
                onChange={v => handlePrivacyOptionChange('showDiary', v)}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-text-primary">Permetti richieste di amicizia</p>
                  <p className="text-xs text-text-secondary">Consenti agli altri utenti di inviarti richieste di amicizia</p>
                </div>
              </div>
              <ToggleSwitch 
                checked={privacyOptions.allowFriendRequests} 
                onChange={v => handlePrivacyOptionChange('friendRequests', v)}
              />
            </div>
          </div>
        )}
      </SettingsSection>
      {/* Sezione Notifiche */}
      <SettingsSection title="Notifiche">
        <div className="space-y-3">
          <p className="text-sm text-text-secondary mb-4">
            Configura come desideri ricevere notifiche per attività e aggiornamenti.
          </p>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-text-primary">Notifiche via email</p>
                <p className="text-xs text-text-secondary">Ricevi notifiche via email quando ci sono aggiornamenti importanti</p>
              </div>
            </div>
            <ToggleSwitch 
              checked={notificationOptions.emailNotifications} 
              onChange={v => handleNotificationOptionChange('notifications', v)}
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};

export default PrivacySettings;