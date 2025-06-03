import React, { useState, useEffect } from 'react';
import { User, Save, Camera } from 'lucide-react';
import SettingsSection from '../SettingsSection';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setUserProfile } from '../../../store/slice/userSlice';
import { updateProfile } from '../../../store/services/profileService';
import { changePassword } from '../../../store/services/passwordService';
import type { UserProfile } from '../../../types/profile';
import Input from '../../auth/Input';
import PasswordStrengthBar from '../../auth/PasswordStrengthBar';

const ProfileSettings: React.FC = () => {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.user.profile);

  // Stato locale per il form, inizializzato da Redux
  const [profile, setProfile] = useState<UserProfile | null>(userProfile);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Stato per la modifica della password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Sincronizza il form con lo stato Redux quando cambia il profilo
  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);
  // Gestisce i cambiamenti nei campi del form
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!profile) return;
    const updatedProfile = { ...profile, [name]: value };
    setProfile(updatedProfile);
    try {
      const updated = await updateProfile(updatedProfile);
      dispatch(setUserProfile(updated));
    } catch (err) {
      alert('Errore durante il salvataggio del profilo.');
    }
  };
  // Gestisce il caricamento dell'avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && profile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const target = event.target;
        if (target && target.result) {
          const updatedProfile = { ...profile, avatar: target.result as string };
          setProfile(updatedProfile);
          try {
            const updated = await updateProfile(updatedProfile);
            dispatch(setUserProfile(updated));
          } catch (err) {
            alert('Errore durante il salvataggio del profilo.');
          }
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
  const handleSavePassword = async () => {
    if (validatePassword()) {
      try {
        await changePassword(passwordData.currentPassword, passwordData.newPassword);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
        alert('Password aggiornata con successo!');
      } catch (err: any) {
        setPasswordErrors({ general: err?.response?.data || 'Errore durante il cambio password.' });
      }
    }
  };

  if (!profile) {
    return <div>Caricamento profilo...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-semibold text-xl text-text-primary">Il tuo profilo</h2>
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
          <h3 className="font-montserrat font-medium text-lg text-text-primary">{profile.fullName || profile.userName}</h3>
          <p className="text-text-secondary text-sm">Carica un'immagine per personalizzare il tuo profilo</p>
        </div>
      </div>
      
      {/* Sezione Informazioni Personali */}
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
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border-color rounded-lg bg-tertiaryBg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
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
              value={profile.fullName || ''}
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
              value={profile.bio || ''}
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
        <form className="grid grid-cols-1 gap-4" onSubmit={e => { e.preventDefault(); handleSavePassword(); }} autoComplete="off">
          <div className="space-y-2">
            <Input
              type={showPassword ? 'text' : 'password'}
              id="currentPassword"
              name="currentPassword"
              label="Password attuale"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              iconRight={
                <span onClick={() => setShowPassword((v) => !v)} title="Mostra/Nascondi password" style={{ cursor: 'pointer' }}>
                  {showPassword ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.13M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/></svg>
                  )}
                </span>
              }
            />
            {passwordErrors.currentPassword && (
              <p className="text-xs text-accent-danger">{passwordErrors.currentPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              label="Nuova password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              iconRight={
                <span onClick={() => setShowNewPassword((v) => !v)} title="Mostra/Nascondi password" style={{ cursor: 'pointer' }}>
                  {showNewPassword ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#666"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.13M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/></svg>
                  )}
                </span>
              }
            />
            {passwordErrors.newPassword && (
              <p className="text-xs text-accent-danger">{passwordErrors.newPassword}</p>
            )}
            <PasswordStrengthBar strength={
              passwordData.newPassword.length === 0 ? '' :
              passwordData.newPassword.length < 8 ? 'debole' :
              /[0-9]/.test(passwordData.newPassword) && /[A-Z]/.test(passwordData.newPassword) && passwordData.newPassword.length > 10 ? 'forte' :
              /[A-Z]/.test(passwordData.newPassword) ? 'media' :
              ''
            } />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              label="Conferma nuova password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-xs text-accent-danger">{passwordErrors.confirmPassword}</p>
            )}
          </div>
          <div className="pt-2">
            <button 
              type="submit"
              className="px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Aggiorna password
            </button>
            {passwordErrors.general && (
              <p className="text-xs text-accent-danger mt-2">{passwordErrors.general}</p>
            )}
          </div>
        </form>
      </SettingsSection>
    </div>
  );
};

export default ProfileSettings;