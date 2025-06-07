import React, { useMemo } from 'react';
import { CalendarRange, Clock, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DiaryFilters from '../diary/DiaryFilters';
import DiaryMonthGroup from '../diary/DiaryMonthGroup';
import { Activity } from '../../types/activity';
import { formatLastUpdate } from '../../utils/dateUtils';
import { calculateActivityStats, getUniqueMonthsForYear } from '../../utils/activityUtils';

interface ProfileDiaryProps {
  activities: Activity[];
  selectedYear: number;
  activeFilters: string[];
  diaryStats: {
    totalEntries: number;
    recentPlaytime: number;
    lastUpdate: string | null;
  };
  months: number[];
  isPrivate: boolean;
  showPrivacyIndicator?: boolean;
  onYearChange: (year: number) => void;
  onFilterChange: (filter: string) => void;
  isOwnProfile?: boolean;
}

const ProfileDiary: React.FC<ProfileDiaryProps> = ({
  activities,
  selectedYear,
  activeFilters,
  diaryStats,
  months,
  isPrivate,
  showPrivacyIndicator = false,
  onYearChange,
  onFilterChange,
  isOwnProfile = false
}) => {  // Calcola le statistiche dinamicamente in base all'anno selezionato
  const yearFilteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const activityYear = new Date(activity.timestamp).getFullYear();
      return activityYear === selectedYear;
    });
  }, [activities, selectedYear]);

  // Calcola le statistiche dinamiche per l'anno selezionato
  const dynamicDiaryStats = useMemo(() => {
    return calculateActivityStats(yearFilteredActivities);
  }, [yearFilteredActivities]);

  // Ricalcola i mesi per l'anno selezionato
  const yearMonths = useMemo(() => {
    return getUniqueMonthsForYear(activities, selectedYear);
  }, [activities, selectedYear]);

  if (isPrivate && !isOwnProfile) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary font-primary">Diario di gioco</h2>
        </div>
        
        <div className="bg-primary-bg rounded-lg shadow-sm p-6">
          <div className="text-center py-10">
            <h3 className="text-xl font-bold text-text-primary font-primary mb-4">
              Diario privato
            </h3>            <p className="text-text-secondary font-secondary max-w-2xl mx-auto">
              Il diario di questo utente è visibile solo agli amici.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary font-primary">Diario di gioco</h2>
        <div className="flex items-center gap-3">
          {showPrivacyIndicator && isPrivate && (
            <div className="flex items-center text-accent-primary text-sm bg-secondary-bg px-3 py-1 rounded-full">
              <Eye className="h-4 w-4 mr-1" />
              <span>Visibile solo a te</span>
            </div>
          )}
          {isOwnProfile && (
            <Link 
              to="/diario" 
              className="flex items-center text-sm text-accent-primary hover:underline"
            >
              <span>Visualizza completo</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          )}
        </div>
      </div>
        <div className="bg-primary-bg rounded-lg shadow-sm p-6">
        {/* Statistiche del diario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
            <CalendarRange className="w-10 h-10 text-accent-primary mr-4" />
            <div>
              <p className="text-sm text-text-secondary">Voci totali</p>
              <p className="text-2xl font-bold text-text-primary">{dynamicDiaryStats.totalEntries}</p>
            </div>
          </div>
          
          <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
            <Clock className="w-10 h-10 text-accent-primary mr-4" />
            <div>
              <p className="text-sm text-text-secondary">Tempo di gioco (ultime 2 settimane)</p>
              <p className="text-2xl font-bold text-text-primary">
                {dynamicDiaryStats.recentPlaytime}h
              </p>
            </div>
          </div>
          
          <div className="bg-secondary-bg p-6 rounded-lg shadow-sm flex items-center">
            <CalendarRange className="w-10 h-10 text-accent-primary mr-4" />
            <div>
              <p className="text-sm text-text-secondary">Ultimo aggiornamento</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatLastUpdate(dynamicDiaryStats.lastUpdate)}
              </p>
            </div>
          </div>
        </div>
          {/* Filtri del diario - sempre visibili se ci sono attività in qualsiasi anno */}
        {activities.length > 0 && (
          <div className="mb-4">
            <DiaryFilters 
              year={selectedYear}
              onYearChange={onYearChange}
              activeFilters={activeFilters}
              onFilterChange={onFilterChange}
            />
          </div>
        )}
        
        {/* Contenuto del diario */}
        {yearFilteredActivities.length > 0 ? (
          <div>
            {/* Visualizza solo il mese più recente nel profilo */}
            {yearMonths.length > 0 && (
              <div className="space-y-6">                  <DiaryMonthGroup 
                  key={`${selectedYear}-${yearMonths[0]}`}
                  month={yearMonths[0]}
                  year={selectedYear}
                  activities={yearFilteredActivities}
                  activeFilters={activeFilters}
                  publicProfile={isOwnProfile ? undefined : { 
                    canViewDiary: !isPrivate, 
                    isFriend: false, // Qui dovremmo aggiungere l'informazione se è amico
                    isOwnProfile: isOwnProfile 
                  }}
                />
                
                {/* Se ci sono altri mesi, mostra un link per visualizzare tutto */}
                {yearMonths.length > 1 && isOwnProfile && (
                  <div className="text-center mt-4">
                    <Link 
                      to="/diario" 
                      className="inline-flex items-center px-4 py-2 bg-secondary-bg text-text-primary rounded-lg hover:bg-tertiary-bg transition-colors"
                    >
                      Visualizza tutti i {yearMonths.length} mesi
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-xl font-bold text-text-primary font-primary mb-4">
              {activities.length > 0 ? `Nessuna attività per il ${selectedYear}` : "Nessuna attività registrata"}
            </h3>
            <p className="text-text-secondary font-secondary max-w-2xl mx-auto mb-6">
              {activities.length > 0 
                ? `Non ci sono attività registrate per l'anno ${selectedYear}. Prova a cambiare anno per vedere altre attività.`
                : (isOwnProfile 
                  ? "Non hai ancora registrato attività nel tuo diario di gioco. Inizia ad aggiungere attività per tenere traccia delle tue esperienze videoludiche!"
                  : "Questo utente non ha ancora registrato attività nel diario di gioco."
                )
              }
            </p>
            {isOwnProfile && activities.length === 0 && (
              <Link 
                to="/diario" 
                className="inline-flex items-center px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
              >
                Vai al diario completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDiary;
