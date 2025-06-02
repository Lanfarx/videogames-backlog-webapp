import React from 'react';
import StatsCard from '../../components/ui/StatsCard';
import StatusDistributionChart from '../../components/dashboard/StatusDistributionChart';
import PlatformBarChart from '../../components/dashboard/PlatformBarChart';
import GenreBarChart from '../../components/dashboard/GenreBarChart';
import RecentActivitiesList from '../../components/dashboard/RecentActivitiesList';
import { PieChartIcon, BarChartIcon, LayoutGrid, BarChart3, Clock } from 'lucide-react';
import { generatePlatformDistributionData, generateGenreDistributionData } from '../../utils/gamesUtils';
import { useGamesStats } from '../../store/hooks/gamesHooks';
import { useAllGames } from '../../store/hooks/gamesHooks';
import { useRecentActivities } from '../../store/hooks/activitiesHooks';
import { useStatusData } from '../../utils/statusUtils';
import AllActivitiesHistoryPopover from '../../components/ui/AllActivitiesHistoryPopover';
import { History } from 'lucide-react';


const DashboardPage: React.FC = () => {
    const { stats, loading, error } = useGamesStats();
    const allGames = useAllGames();
    const { activities: recentActivities, loading: recentLoading } = useRecentActivities(5);
    const StatusData = useStatusData();
    const [showHistory, setShowHistory] = React.useState(false);

    // Usa la funzione centralizzata per la distribuzione piattaforme
    const PlatformData = generatePlatformDistributionData(allGames)
      .slice(0, 4)
      .map(item => ({ Platform: item.label, count: item.value }));

    // Usa la funzione centralizzata per la distribuzione generi
    const genreData = generateGenreDistributionData(allGames);    return (
        <div className="flex flex-col bg-secondaryBg min-h-screen p-6">
            {/* Intestazione pagina */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h1 className="text-3xl font-bold text-text-primary font-['Montserrat']">Dashboard</h1>
            </div>

            {/* Statistiche Rapide */}
            <div className="grid grid-cols-3 gap-5 mb-6">
                <StatsCard 
                    label="Giochi Totali" 
                    value={loading ? "..." : stats.total.toString()} 
                    icon={<LayoutGrid className="h-6 w-6 text-accent-primary" />} 
                />
                <StatsCard 
                    label="Ore Totali di Gioco" 
                    value={loading ? "..." : stats.totalHours.toString()} 
                    icon={<Clock className="h-6 w-6 text-accent-secondary" />} 
                />
                <StatsCard 
                    label="Giochi Completati" 
                    value={stats.completed.toString()} 
                    icon={<BarChart3 className="h-6 w-6 text-accent-success" />} 
                />
            </div>

            {/* Grafici Principali */}
            <div className="grid grid-cols-2 gap-5 mb-6">
                <StatusDistributionChart 
                    data={StatusData} 
                    icon={<PieChartIcon className="h-5 w-5 text-accent-primary mr-2" />} 
                    title="Distribuzione per Stato" 
                />
                <PlatformBarChart 
                    data={PlatformData} 
                    icon={<BarChartIcon className="h-5 w-5 text-accent-primary mr-2" />}
                    title="Piattaforme più utilizzate" 
                />
            </div>

            {/* Grafici Secondari */}
            <div className="grid grid-cols-2 gap-5 mb-6">
                <GenreBarChart 
                    data={genreData} 
                    icon={<BarChart3 className="h-5 w-5 text-accent-primary mr-2" />}
                    title="Generi più giocati" 
                />
                <div className="bg-white p-6 shadow-sm rounded-lg">
                    <div className="flex items-baseline justify-between mb-6">
                      <h2 className="text-xl font-bold text-text-primary font-['Montserrat'] flex items-center">
                        <Clock className="h-5 w-5 text-accent-primary mr-2" />
                        Attività Recente
                      </h2>
                      <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setShowHistory(true)}>
                        <History className="h-6 w-6 text-text-secondary group-hover:text-accent-primary transition-colors" />
                        <span className="text-sm text-text-secondary mt-0.5 font-secondary group-hover:text-accent-primary transition-colors">Cronologia completa</span>
                      </div>                    </div>                    {showHistory && (
                      <AllActivitiesHistoryPopover
                        onClose={() => setShowHistory(false)}
                      />
                    )}
                    <RecentActivitiesList 
                      activities={recentActivities} 
                      icon={undefined}
                      title={''}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;