import React from 'react';
import { User, Camera } from 'lucide-react';

interface AvatarUploadProps {
  avatarUrl: string | null | undefined;
  fullName: string | null | undefined;
  userName: string;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AvatarUpload({ avatarUrl, fullName, userName, onAvatarChange }: AvatarUploadProps) {
  return (
    <div className="flex flex-col items-center md:flex-row gap-6 mb-8">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-tertiary-bg border border-border-color flex items-center justify-center">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <User className="w-12 h-12 text-text-secondary" />
          )}
        </div>
        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1 bg-accent-primary rounded-full cursor-pointer hover:opacity-90 transition-opacity">
          <Camera className="w-4 h-4 text-white" />
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="hidden"
            onChange={onAvatarChange} 
          />
        </label>
      </div>
      <div>
        <h3 className="font-montserrat font-medium text-lg text-text-primary">{fullName || userName}</h3>
        <p className="text-text-secondary text-sm">Carica un'immagine per personalizzare il tuo profilo</p>
      </div>
    </div>
  );
}
