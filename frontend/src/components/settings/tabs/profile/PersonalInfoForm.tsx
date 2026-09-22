import React from 'react';
import SettingsSection from '../../SettingsSection';
import type { UserProfile } from '../../../../types/profile';

interface PersonalInfoFormProps {
  profile: UserProfile;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function PersonalInfoForm({ profile, onChange }: PersonalInfoFormProps) {
  return (
    <SettingsSection title="Informazioni personali">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="UserName" className="block text-sm font-medium text-text-secondary">
            Nome utente
          </label>
          <input
            type="text"
            id="UserName"
            name="UserName"
            value={profile.userName}
            readOnly
            onChange={onChange}
            className="w-full px-3 py-2 border border-border-color rounded-lg bg-tertiary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
           <p className="text-xs text-text-secondary">Il nome utente non può essere modificato</p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={profile.email}
            readOnly
            className="w-full px-3 py-2 border border-border-color rounded-lg bg-tertiary-bg text-text-secondary focus:outline-none cursor-not-allowed"
          />
          <p className="text-xs text-text-secondary">L'email non può essere modificata</p>
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary">
            Nome completo
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={profile.fullName || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-text-secondary">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={profile.bio || ''}
            onChange={onChange}
            rows={4}
            className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
            placeholder="Scrivi qualcosa su di te..."
          />
          <p className="text-xs text-text-secondary">
            Breve descrizione che sarà visibile sul tuo profilo pubblico.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
