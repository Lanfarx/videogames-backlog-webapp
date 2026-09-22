import React, { useState } from 'react';
import SettingsSection from '../../SettingsSection';
import Input from '../../../auth/Input';
import PasswordStrengthBar from '../../../auth/PasswordStrengthBar';
import { changePassword } from '../../../../store/services/passwordService';

export function ChangePasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validatePassword = (): boolean => {
    const errors: typeof passwordErrors = {};
    
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

  return (
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
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.13M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/></svg>
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
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-text-secondary"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95M6.7 6.7A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.293 5.13M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/></svg>
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
            className="px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            Aggiorna password
          </button>
          {passwordErrors.general && (
            <p className="text-xs text-accent-danger mt-2">{passwordErrors.general}</p>
          )}
        </div>
      </form>
    </SettingsSection>
  );
}
