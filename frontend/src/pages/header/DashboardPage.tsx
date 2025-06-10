import React from 'react';
import StatsCard from '../../components/ui/StatsCard';
import StatusDistributionChart from '../../components/dashboard/StatusDistributionChart';
import PlatformBarChart from '../../components/dashboard/PlatformBarChart';
import GenreBarChart from '../../components/dashboard/GenreBarChart';
import RecentActivitiesList from '../../components/dashboard/RecentActivitiesList';
import { PieChartIcon, BarChartIcon, LayoutGrid, BarChart3, Clock, Trophy } from 'lucide-react';
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
        <div className="flex flex-col bg-secondary-bg min-h-screen p-6">
            {/* Intestazione pagina con animazione */}
            <div className="bg-primary-bg p-6 rounded-lg shadow-sm mb-6 animate-fade-in-up">
                <h1 className="text-3xl font-bold text-text-primary font-['Montserrat']">Dashboard</h1>
            </div>            {/* Statistiche Rapide con animazioni staggered */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="animate-fade-in-up delay-100">
                    <StatsCard 
                        label="Giochi Totali" 
                        value={loading ? "..." : stats.total.toString()} 
                        icon={<LayoutGrid className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                    />
                </div>
                <div className="animate-fade-in-up delay-200">
                    <StatsCard 
                        label="Ore Totali di Gioco" 
                        value={loading ? "..." : stats.totalHours.toString()} 
                        icon={<Clock className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                    />
                </div>
                <div className="animate-fade-in-up delay-300">
                    <StatsCard 
                        label="Giochi Completati" 
                        value={stats.completed.toString()} 
                        icon={<Trophy className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                    />
                </div>
                <div className="animate-fade-in-up delay-400">
                    <StatsCard 
                        label="Ore Medie per Gioco" 
                        value={loading ? "..." : (stats.total > 0 ? Math.round(stats.totalHours / stats.total).toString() : "0")} 
                        icon={<Clock className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                    />
                </div>
                <div className="animate-fade-in-up delay-500">
                    <StatsCard 
                        label="Tasso di Completamento" 
                        value={loading ? "..." : (stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%")} 
                        icon={<Trophy className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                    />
                </div>
            </div>{/* Grafici Principali con animazioni */}
            <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="animate-fade-in-up delay-400">
                    <StatusDistributionChart 
                        data={StatusData} 
                        icon={<PieChartIcon className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />} 
                        title="Distribuzione per Stato" 
                    />
                </div>
                <div className="animate-fade-in-up delay-500">
                    <div className="bg-primary-bg p-6 shadow-sm rounded-lg border border-border-color hover:shadow-lg hover:border-accent-primary/30">
                        <div className="flex items-baseline justify-between mb-6">
                          <h2 className="text-xl font-bold text-text-primary font-['Montserrat'] flex items-center">
                            <Clock className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />
                            Attività Recente
                          </h2>
                          <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setShowHistory(true)}>
                            <History className="h-6 w-6 text-text-secondary group-hover:text-accent-primary transition-colors" />
                            <span className="text-sm text-text-secondary mt-0.5 font-secondary group-hover:text-accent-primary transition-colors">Cronologia completa</span>
                          </div>                    
                        </div>                    
                        {showHistory && (
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
            </div>            {/* Grafici Secondari con animazioni */}
            <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="animate-fade-in-up delay-600">
                    <GenreBarChart 
                        data={genreData} 
                        icon={<BarChart3 className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                        title="Generi più giocati" 
                    />
                </div>
                <div className="animate-fade-in-up delay-700">
                    <PlatformBarChart 
                        data={PlatformData} 
                        icon={<BarChartIcon className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                        title="Piattaforme più utilizzate" 
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;