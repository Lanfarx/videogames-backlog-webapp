import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const ProfileAvatar: React.FC = () => {
  const userProfile = useSelector((state: RootState) => state.user.profile);

  return (
    <NavLink to="/profile">
      <div className="h-11 w-11 rounded-full bg-tertiary-bg border-2 border-accent-primary cursor-pointer flex items-center justify-center overflow-hidden">
        {userProfile && userProfile.avatar ? (
          <img 
            src={userProfile.avatar} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <span className="text-accent-primary font-bold text-lg">
            {userProfile && userProfile.userName ? userProfile.userName.charAt(0).toUpperCase() : 'U'}
          </span>
        )}
      </div>
    </NavLink>
  );
};

export default ProfileAvatar;
