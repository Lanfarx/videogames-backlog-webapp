import React, { useState, useEffect } from 'react';
import BreadcrumbNav from './BreadcrumbNav';
import { Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import AppLogo from '../../ui/atoms/AppLogo';
import { loadFromLocal } from '../../../utils/localStorage';
import ProfileAvatar from '../../ui/ProfileAvatar';

interface GamePageHeaderProps {
  title: string;
  parentPath?: string;
  parentLabel?: string;
}

const GamePageHeader: React.FC<GamePageHeaderProps> = ({ 
  title, 
  parentPath = '/library', 
  parentLabel = 'Libreria' 
}) => {
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
    <header className="h-16 border-b border-border-color flex items-center px-6">
      <div className="flex-1 flex items-center gap-3">
        <AppLogo className="h-7 w-auto" asLink={true} />
        <BreadcrumbNav title={title} parentPath={parentPath} parentLabel={parentLabel} />
      </div>
      <div className="flex items-center space-x-5">
        <NavLink to="/settings">
          {({ isActive }) => (
            <Settings className={`h-6 w-6 ${isActive ? 'text-accent-primary' : 'text-text-secondary hover:text-accent-primary'} cursor-pointer`} />
          )}
        </NavLink>
        <ProfileAvatar />
      </div>
    </header>
  );
};

export default GamePageHeader;
