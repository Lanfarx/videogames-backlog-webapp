import { User, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileHeader from '../profile/ProfileHeader';
import ProfileStats from '../profile/ProfileStats';
import ProfileDiary from '../profile/ProfileDiary';
import FriendshipActionButtons from './FriendshipActionButtons';
import { usePublicProfileView } from '../../hooks/usePublicProfileView';
import { useFriendshipActionsHandler } from '../../hooks/useFriendshipActionsHandler';

interface PublicProfileViewProps {
  className?: string;
  userName?: string;
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-secondary-bg rounded-lg p-6 mb-10">
        <div className="h-8 bg-tertiary-bg rounded mb-4"></div>
        <div className="flex gap-8">
          <div className="w-32 h-32 bg-tertiary-bg rounded-full"></div>
          <div className="flex-1">
            <div className="h-8 bg-tertiary-bg rounded mb-2"></div>
            <div className="h-4 bg-tertiary-bg rounded mb-2"></div>
            <div className="h-16 bg-tertiary-bg rounded"></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="h-24 bg-secondary-bg rounded"></div>
        <div className="h-24 bg-secondary-bg rounded"></div>
        <div className="h-24 bg-secondary-bg rounded"></div>
        <div className="h-24 bg-secondary-bg rounded"></div>
      </div>
      <div className="h-64 bg-secondary-bg rounded"></div>
    </div>
  );
}

export default function PublicProfileView({ className = '', userName: propUserName }: PublicProfileViewProps) {
  const { userName: urlUserName } = useParams<{ userName: string }>();
  const userName = propUserName || urlUserName;
  const navigate = useNavigate();

  const {
    profile,
    loading,
    error,
    selectedYear,
    setSelectedYear,
    activeFilters,
    handleFilterChange,
    activities,
    loadingActivities,
    months,
    reloadProfile
  } = usePublicProfileView(userName);

  const handleAction = useFriendshipActionsHandler(profile, userName, reloadProfile);

  const placeholderDiaryStats = {
    totalEntries: 0,
    recentPlaytime: 0,
    lastUpdate: null
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-primary-bg font-secondary ${className}`}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen bg-primary-bg font-secondary ${className}`}>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Torna indietro</span>
          </button>
          <div className="bg-secondary-bg rounded-xl p-8 text-center border border-border-color">
            <User className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Profilo non trovato
            </h2>
            <p className="text-text-secondary">
              {error || "L'utente che stai cercando non esiste o il suo profilo è privato."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPrivate = profile.isProfilePrivate && !profile.isFriend;

  return (
    <div className={`min-h-screen bg-primary-bg font-secondary ${className}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Torna indietro</span>
          </button>
        </div>

        <ProfileHeader 
          profile={profile as any} 
          isPublicView={true}
          customActions={
            <FriendshipActionButtons 
              status={profile.friendshipStatus} 
              onAction={handleAction} 
            />
          }
        />

        {isPrivate ? (
          <div className="bg-secondary-bg rounded-xl p-8 text-center border border-border-color mt-8">
            <User className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Profilo Privato
            </h2>
            <p className="text-text-secondary">
              Aggiungi {profile.userName} agli amici per vedere le sue statistiche e il suo diario.
            </p>
          </div>
        ) : (
          <>
            {profile.stats ? <ProfileStats stats={profile.stats} /> : null}

            {profile.canViewDiary ? (
              <ProfileDiary 
                activities={activities}
                loading={loadingActivities}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                months={months}
                stats={profile.diaryStats || placeholderDiaryStats}
                publicProfileContext={{
                  canViewDiary: profile.canViewDiary,
                  isFriend: profile.isFriend,
                  isOwnProfile: false
                }}
              />
            ) : (
              <div className="mt-8 bg-secondary-bg border border-border-color rounded-xl p-8 text-center">
                <div className="text-text-secondary mb-2">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Il diario di questo utente è privato</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
