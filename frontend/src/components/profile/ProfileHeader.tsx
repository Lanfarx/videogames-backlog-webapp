import React from 'react';
import { Lock } from 'lucide-react';
import { calculateActivityDays } from '../../utils/dateUtils';

interface ProfileHeaderProps {
  userProfile: {
    avatar?: string;
    UserName?: string;  // Per profilo proprio
    userName?: string;  // Per profilo pubblico  
    fullName?: string;
    memberSince?: string;
    bio?: string;
    tags?: string | string[];
  };
  isProfilePrivate: boolean;
  isOwnProfile?: boolean;
  onLogout?: () => void;
  // Per profili pubblici
  actionButton?: React.ReactNode;
  backButton?: React.ReactNode;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userProfile,
  isProfilePrivate,
  isOwnProfile = false,
  onLogout,
  actionButton,
  backButton
}) => {  return (
    <div className="bg-primary-bg rounded-lg shadow-sm p-6 mb-10 relative">
      {/* Pulsanti di azione per profili pubblici - Layout non sovrapposto */}
      {!isOwnProfile && (backButton || actionButton) && (
        <div className="flex justify-between items-center mb-6">
          <div>
            {backButton}
          </div>
          <div>
            {actionButton}
          </div>
        </div>
      )}
      
      {/* Pulsante Logout per profilo personale */}
      {isOwnProfile && onLogout && (
        <button
          onClick={onLogout}
          className="absolute top-6 right-6 bg-accent-danger hover:bg-accent-primary/90 focus:ring-2 focus:ring-accent-primary text-white font-secondary text-base shadow-md border-0 transition-colors duration-150 px-8 py-2 rounded-lg h-12 min-w-[140px] z-10"
          style={{ minWidth: 0, height: 'auto', fontSize: '1rem' }}
        >
          Logout
        </button>
      )}

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        {/* Immagine profilo */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-accent-primary bg-tertiary-bg flex items-center justify-center overflow-hidden">
            {userProfile.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            ) : (              <span className="text-accent-primary font-bold text-4xl">
                {(userProfile.UserName || userProfile.userName) ? (userProfile.UserName || userProfile.userName)!.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          {isProfilePrivate && (
            <div className="absolute -top-2 -right-2 bg-secondary-bg p-1.5 rounded-full border-2 border-border-color">
              <Lock className="h-4 w-4 text-accent-primary" />
            </div>
          )}
        </div>
        
        {/* Informazioni profilo */}
        <div className="flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">            <h1 className="text-3xl font-bold text-text-primary font-primary">
              {userProfile.fullName || userProfile.UserName || userProfile.userName}
            </h1>
            {isProfilePrivate && (
              <div className="flex items-center text-accent-primary text-sm">
                <Lock className="h-4 w-4 mr-1" />
                <span>Profilo privato</span>
              </div>
            )}
          </div>
          <div className="text-text-secondary mb-4 text-center md:text-left">
            <p className="text-sm">Membro dal {userProfile.memberSince ? new Date(userProfile.memberSince).toLocaleDateString('it-IT') : ''}</p>
          </div>
          
          {userProfile.bio && (
            <div className="bg-secondary-bg p-4 rounded-lg mb-4">
              <p className="text-text-secondary font-secondary">
                {userProfile.bio}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(Array.isArray(userProfile.tags) ? userProfile.tags : typeof userProfile.tags === 'string' && userProfile.tags.length > 0 ? userProfile.tags.split(',') : []).map((tag: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-tertiary-bg text-text-secondary text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
