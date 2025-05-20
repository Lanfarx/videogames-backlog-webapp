import React, { useState } from 'react';
import { Globe, Lock, Clock, BarChart2, UserPlus, Mail, MessageSquare } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import ToggleSwitch from '../ToggleSwitch';

interface PrivacySettingsProps {
  isProfilePublic: boolean;
  privacyOptions: {
    showPlaytime: boolean;
    showLibraryStats: boolean;
    allowFriendRequests: boolean;
  };
  notificationOptions: {
    emailNotifications: boolean;
    messageFromNonFollowers: boolean;
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
                <Clock className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-text-primary">Mostra ore di gioco</p>
                  <p className="text-xs text-text-secondary">Consenti agli altri utenti di vedere le tue ore di gioco</p>
                </div>
              </div>
              <ToggleSwitch 
                checked={privacyOptions.showPlaytime} 
                onChange={(value) => onPrivacyOptionChange('showPlaytime', value)}
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <BarChart2 className="w-5 h-5 text-text-secondary" />
                <div>
                  <p className="text-text-primary">Mostra statistiche libreria</p>
                  <p className="text-xs text-text-secondary">Consenti agli altri utenti di vedere le statistiche della tua libreria</p>
                </div>
              </div>
              <ToggleSwitch 
                checked={privacyOptions.showLibraryStats} 
                onChange={(value) => onPrivacyOptionChange('showLibraryStats', value)}
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
      
      {/* Sezione Messaggi e Notifiche */}
      <SettingsSection title="Messaggi e notifiche">
        <div className="space-y-3">
          <p className="text-sm text-text-secondary mb-4">
            Configura come desideri ricevere notifiche e chi può inviarti messaggi.
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
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-text-secondary" />
              <div>
                <p className="text-text-primary">Messaggi da utenti che non segui</p>
                <p className="text-xs text-text-secondary">Permetti agli utenti che non segui di inviarti messaggi</p>
              </div>
            </div>
            <ToggleSwitch 
              checked={notificationOptions.messageFromNonFollowers} 
              onChange={(value) => onNotificationOptionChange('messageFromNonFollowers', value)}
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  );
};

export default PrivacySettings;