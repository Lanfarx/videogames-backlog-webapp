import React from 'react';
import { getRecentActivities } from '../../utils/activitiesData';
import { useStatusData } from '../../utils/statusData';
import StatsCard from '../../components/ui/StatsCard';
import StatusDistributionChart from '../../components/dashboard/StatusDistributionChart';
import PlatformBarChart from '../../components/dashboard/PlatformBarChart';
import GenreBarChart from '../../components/dashboard/GenreBarChart';
import RecentActivitiesList from '../../components/dashboard/RecentActivitiesList';
import { PieChartIcon, BarChartIcon, LayoutGrid, BarChart3, Clock } from 'lucide-react';
import { useGamesStats, useAllGames } from '../../utils/gamesHooks';

const DashboardPage: React.FC = () => {
    const stats = useGamesStats();
    const allGames = useAllGames();
    const recentActivities = getRecentActivities(5);
    const statusData = useStatusData();
    
    // Calcolare le statistiche per piattaforme
    const platformCounts = allGames.reduce((acc: Record<string, number>, game) => {
      acc[game.platform] = (acc[game.platform] || 0) + 1;
      return acc;
    }, {});

    // Convertire in array e ordinare per conteggio
    const platformData = Object.entries(platformCounts)
        .map(([platform, count]) => ({ platform, count }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 4);

    // Calcolare le statistiche per generi
    const genreCounts: Record<string, number> = {};
    allGames.forEach((game) => {
      game.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    // Convertire in array e ordinare per conteggio
    const genreData = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 5);

    return (
        <div className="flex flex-col bg-secondaryBg min-h-screen p-6">
            {/* Intestazione pagina */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h1 className="text-3xl font-bold text-text-primary font-['Montserrat']">Dashboard</h1>
            </div>

            {/* Statistiche Rapide */}
            <div className="grid grid-cols-3 gap-5 mb-6">
                <StatsCard 
                    label="Giochi Totali" 
                    value={stats.total.toString()} 
                    icon={<LayoutGrid className="h-6 w-6 text-accent-primary" />} 
                />
                <StatsCard 
                    label="Giochi Completati" 
                    value={stats.completed.toString()} 
                    icon={<BarChart3 className="h-6 w-6 text-accent-success" />} 
                />
                <StatsCard 
                    label="Ore Totali di Gioco" 
                    value={stats.totalHours.toString()} 
                    icon={<Clock className="h-6 w-6 text-accent-secondary" />} 
                />
            </div>

            {/* Grafici Principali */}
            <div className="grid grid-cols-2 gap-5 mb-6">
                <StatusDistributionChart 
                    data={statusData} 
                    icon={<PieChartIcon className="h-5 w-5 text-accent-primary mr-2" />} 
                    title="Distribuzione per Stato" 
                />
                <PlatformBarChart 
                    data={platformData} 
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
                <RecentActivitiesList 
                    activities={recentActivities} 
                    icon={<Clock className="h-5 w-5 text-accent-primary mr-2" />}
                    title="Attività Recente" 
                />
            </div>
        </div>
    );
};

export default DashboardPage;