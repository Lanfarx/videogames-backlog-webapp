import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { loadFromLocal } from '../../utils/localStorage';

const ProfileAvatar: React.FC = () => {
  const [userProfile, setUserProfile] = useState({
    username: 'utente123',
    avatar: null
  });

  useEffect(() => {
    const loadProfileData = () => {
      const savedProfileData = loadFromLocal('profileData');
      if (savedProfileData) {
        setUserProfile({
          username: savedProfileData.username || 'utente123',
          avatar: savedProfileData.avatar || null
        });
      }
    };
    loadProfileData();
    window.addEventListener('storage', loadProfileData);
    return () => {
      window.removeEventListener('storage', loadProfileData);
    };
  }, []);

  return (
    <NavLink to="/profile">
      <div className="h-11 w-11 rounded-full bg-tertiary-bg border-2 border-accent-primary cursor-pointer flex items-center justify-center overflow-hidden">
        {userProfile.avatar ? (
          <img 
            src={userProfile.avatar} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="text-accent-primary font-bold text-lg">
            {userProfile.username.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </NavLink>
  );
};

export default ProfileAvatar;
