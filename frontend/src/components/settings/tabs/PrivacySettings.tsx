import React, { useState } from 'react';
import { Globe, Lock, BookOpen, BarChart2, UserPlus, Mail, MessageSquare, Clock } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';

interface PrivacySettingsProps {
  isProfilePublic: boolean;
  privacyOptions: {
    showStats: boolean;
    showDiary: boolean;
    allowFriendRequests: boolean;
  };
  notificationOptions: {
    emailNotifications: boolean;
  };
  onProfileVisibilityChange: (isPublic: boolean) => void;
  onPrivacyOptionChange: (option: string, value: boolean) => void;
  onNotificationOptionChange: (option: string, value: boolean) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  isProfilePublic,
  privacyOptions,
  notificationOptions,
  onProfileVisibilityChange,
  onPrivacyOptionChange,
  onNotificationOptionChange
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-semibold text-xl text-text-primary">Impostazioni privacy</h2>
      </div>
      
      {/* Sezione Visibilità Profilo */}
      <SettingsSection title="Visibilità del profilo">
        <div className="flex items-center justify-between bg-tertiaryBg p-4 rounded-lg mb-4">
          <div className="flex items-center space-x-3">
            {isProfilePublic ? (
              <Globe className="w-5 h-5 text-accent-success" />
            ) : (
              <Lock className="w-5 h-5 text-text-secondary" />
            )}
            <div>
              <h3 className="font-medium text-text-primary">
                {isProfilePublic ? 'Profilo pubblico' : 'Profilo privato'}
              </h3>
              <p className="text-sm text-text-secondary">
                {isProfilePublic 
                  ? 'Il tuo profilo e le tue statistiche sono visibili agli altri utenti' 
                  : 'Solo tu puoi vedere il tuo profilo e le tue statistiche'}
              </p>
            </div>
          </div>
          <ToggleSwitch 
            checked={isProfilePublic} 
            onChange={onProfileVisibilityChange}
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
                onChange={(value) => onPrivacyOptionChange('showStats', value)}
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
                onChange={(value) => onPrivacyOptionChange('showDiary', value)}
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
                onChange={(value) => onPrivacyOptionChange('allowFriendRequests', value)}
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
              onChange={(value) => onNotificationOptionChange('emailNotifications', value)}
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};

export default PrivacySettings;