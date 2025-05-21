import React, { useState, useEffect } from 'react';
import { User, Save, Camera } from 'lucide-react';
import SettingsSection from '../SettingsSection';

interface ProfileData {
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string | null;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileSettings: React.FC = () => {
  // Stato per i dati del profilo
  const [profile, setProfile] = useState<ProfileData>(() => {
    const savedProfile = localStorage.getItem('profileData');
    return savedProfile ? JSON.parse(savedProfile) : {
      username: 'utente123',
      email: 'utente@esempio.com',
      fullName: 'Mario Rossi',
      bio: 'Appassionato di videogiochi, in particolare RPG e strategici.',
      avatar: null
    };
  });
  
  // Stato per la modifica della password
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Stato per tracciare le modifiche
  const [isEdited, setIsEdited] = useState(false);
  
  // Stato per tracciare gli errori della password
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  
  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    setIsEdited(true);
  };
  


  // Gestisce il caricamento dell'avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const target = event.target;
        if (target && target.result) {
          setProfile(prev => ({
            ...prev,
            avatar: target.result as string
          }));
          setIsEdited(true);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Gestisce i cambiamenti nei campi del form della password
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Resetta gli errori quando l'utente inizia a digitare
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  // Valida i dati della password
  const validatePassword = (): boolean => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
      general?: string;
    } = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'La password attuale è obbligatoria';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'La nuova password è obbligatoria';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'La password deve essere di almeno 8 caratteri';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Conferma la nuova password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Le password non corrispondono';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Gestisce il salvataggio della password
  const handleSavePassword = () => {
    if (validatePassword()) {
      console.log('Salvataggio password:', passwordData);
      
      // Simulazione di un salvataggio riuscito
      setTimeout(() => {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        alert('Password aggiornata con successo!');
      }, 1000);
    }
  };

  // Gestisce il salvataggio del profilo
  const handleSave = () => {
    // Salva i dati del profilo nel localStorage
    console.log('Salvataggio profilo:', profile);
    localStorage.setItem('profileData', JSON.stringify(profile));
    
    // Aggiorna lo stato e mostra conferma
    setTimeout(() => {
      setIsEdited(false);
      // Trigger un evento di storage per aggiornare altre componenti
      window.dispatchEvent(new Event('storage'));
      alert('Profilo aggiornato con successo!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-semibold text-xl text-text-primary">Il tuo profilo</h2>
        {isEdited && (
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Salva modifiche
          </button>
        )}
      </div>
      
      {/* Sezione Avatar */}
      <div className="flex flex-col items-center md:flex-row gap-6 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-tertiaryBg border border-border-color flex items-center justify-center">
            {profile.avatar ? (
              <img 
                src={profile.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="w-12 h-12 text-text-secondary" />
            )}
          </div>
          <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-1 bg-accent-primary rounded-full cursor-pointer hover:bg-accent-primary/90 transition-colors">
            <Camera className="w-4 h-4 text-white" />
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handleAvatarChange} 
            />
          </label>
        </div>
        <div>
          <h3 className="font-montserrat font-medium text-lg text-text-primary">{profile.fullName || profile.username}</h3>
          <p className="text-text-secondary text-sm">Carica un'immagine per personalizzare il tuo profilo</p>
        </div>
      </div>
      
      {/* Sezione Informazioni Personali */}
      <SettingsSection title="Informazioni personali">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary">
              Nome utente
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={profile.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border-color rounded-lg bg-primaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
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
              className="w-full px-3 py-2 border border-border-color rounded-lg bg-tertiaryBg text-text-secondary focus:outline-none cursor-not-allowed"
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
              value={profile.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border-color rounded-lg bg-primaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-text-secondary">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-border-color rounded-lg bg-primaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
              placeholder="Scrivi qualcosa su di te..."
            />
            <p className="text-xs text-text-secondary">
              Breve descrizione che sarà visibile sul tuo profilo pubblico.
            </p>
          </div>
        </div>
      </SettingsSection>
      
      {/* Sezione Cambio Password */}
      <SettingsSection title="Cambio Password">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-text-secondary">
              Password attuale
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border ${passwordErrors.currentPassword ? 'border-accent-danger' : 'border-border-color'} rounded-lg bg-primaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary`}
            />
            {passwordErrors.currentPassword && (
              <p className="text-xs text-accent-danger mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary">
              Nuova password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border ${passwordErrors.newPassword ? 'border-accent-danger' : 'border-border-color'} rounded-lg bg-primaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary`}
            />
            {passwordErrors.newPassword && (
              <p className="text-xs text-accent-danger mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary">
              Conferma nuova password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border ${passwordErrors.confirmPassword ? 'border-accent-danger' : 'border-border-color'} rounded-lg bg-primaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary`}
            />
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-accent-danger mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>
          
          <div className="pt-2">
            <button 
              onClick={handleSavePassword}
              className="px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Aggiorna password
            </button>
          </div>
        </div>
      </SettingsSection>
      
      {/* Pulsante Salva (mobile) */}
      {isEdited && (
        <div className="md:hidden mt-6">
          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Salva modifiche
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;