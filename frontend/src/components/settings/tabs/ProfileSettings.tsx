import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { setUserProfile } from '../../../store/slice/userSlice';
import { updateProfile } from '../../../store/services/profileService';
import type { UserProfile } from '../../../types/profile';
import { AvatarUpload } from './profile/AvatarUpload';
import { PersonalInfoForm } from './profile/PersonalInfoForm';
import { ChangePasswordForm } from './profile/ChangePasswordForm';

export default function ProfileSettings() {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const [profile, setProfile] = useState<UserProfile | null>(userProfile);
  
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (!profile) return;
    
    const updatedProfile = { ...profile, [name]: value };
    setProfile(updatedProfile);
    
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const newTimeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        const updated = await updateProfile(updatedProfile);
        dispatch(setUserProfile(updated));
      } catch (err) {
        alert('Errore durante il salvataggio del profilo.');
        setProfile(userProfile);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
    
    setSaveTimeout(newTimeout);
  };

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

  if (!profile) {
    return <div>Caricamento profilo...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-montserrat font-semibold text-xl text-text-primary">Il tuo profilo</h2>
        {isSaving && (
          <div className="flex items-center text-sm text-text-secondary">
            <div className="animate-spin w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full mr-2"></div>
            Salvataggio in corso...
          </div>
        )}
      </div>
      
      <AvatarUpload 
        avatarUrl={profile.avatar}
        fullName={profile.fullName}
        userName={profile.userName}
        onAvatarChange={handleAvatarChange}
      />
      
      <PersonalInfoForm 
        profile={profile}
        onChange={handleChange}
      />
      
      <ChangePasswordForm />
    </div>
  );
}