import React from 'react';
import { Gamepad2, Clock, Trophy, CalendarRange, Eye } from 'lucide-react';
import StatsCard from '../ui/StatsCard';
import StatusStatsGrid from './StatusStatsGrid';
import { calculateActivityDays } from '../../utils/dateUtils';

interface ProfileStatsProps {
  stats?: {
    total: number;
    totalHours: number;
    completed: number;
    notStarted: number;
    inProgress: number;
    platinum: number;
    abandoned: number;
  };
  userProfile: {
    memberSince?: string;
  };
  isPrivate: boolean;
  showPrivacyIndicator?: boolean;
  title?: string;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  stats,
  userProfile,
  isPrivate,
  showPrivacyIndicator = false,
  title = "Le mie statistiche"
}) => {  // Se le stats sono private e non è il proprio profilo, mostra messaggio di privacy
  if (isPrivate && showPrivacyIndicator) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary font-primary">{title}</h2>
        </div>
        
        <div className="bg-primary-bg rounded-lg shadow-sm p-6">
          <div className="text-center py-10">
            <h3 className="text-xl font-bold text-text-primary font-primary mb-4">
              Statistiche private
            </h3>            <p className="text-text-secondary font-secondary max-w-2xl mx-auto">
              Le statistiche di questo utente sono visibili solo agli amici.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Prepara i dati per le statistiche di status solo se stats è definito
  const statusStats = stats ? {
    notStarted: stats.notStarted,
    inProgress: stats.inProgress,
    completed: stats.completed,
    abandoned: stats.abandoned
  } : {
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    abandoned: 0
  };

  return (
    <div className="mb-10">      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary font-primary">{title}</h2>
        {showPrivacyIndicator && isPrivate && (
          <div className="flex items-center text-accent-primary text-sm bg-secondary-bg px-3 py-1 rounded-full">
            <Eye className="h-4 w-4 mr-1" />
            <span>Visibile solo a te</span>
          </div>
        )}
      </div>        {/* Statistiche principali */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          label="Totale giochi" 
          value={stats?.total?.toString() || "0"} 
          icon={<Gamepad2 className="h-8 w-8 text-accent-primary" />}
        />
        <StatsCard 
          label="Ore giocate" 
          value={Math.round(stats?.totalHours || 0).toString()} 
          icon={<Clock className="h-8 w-8 text-accent-primary" />}
        />        <StatsCard 
          label="Tasso completamento" 
          value={stats?.total && stats.total > 0 ? `${Math.round(((stats?.completed || 0) / stats.total) * 100)}%` : "0%"} 
          icon={<Trophy className="h-8 w-8 text-accent-primary" />}
        />
        <StatsCard 
          label="Giorni di attività" 
          value={userProfile?.memberSince ? calculateActivityDays(userProfile.memberSince).toString() : "0"} 
          icon={<CalendarRange className="h-8 w-8 text-accent-primary" />}
        />
      </div>

      {/* Statistiche per status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary font-primary mb-4">Status dei giochi</h3>
        <StatusStatsGrid statusStats={statusStats} />
      </div>
    </div>
  );
};

export default ProfileStats;
