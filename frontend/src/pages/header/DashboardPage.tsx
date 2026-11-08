import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/ui/StatsCard';
import StatusDistributionChart from '../../components/dashboard/StatusDistributionChart';
import PlatformBarChart from '../../components/dashboard/PlatformBarChart';
import GenreBarChart from '../../components/dashboard/GenreBarChart';
import RecentActivitiesList from '../../components/dashboard/RecentActivitiesList';
import MonthlyChart from '../../components/dashboard/MonthlyChart';
import GameHighlightList from '../../components/dashboard/GameHighlightList';
import PlayHeatmap from '../../components/dashboard/PlayHeatmap';
import YearlyGoalCard from '../../components/dashboard/YearlyGoalCard';
import { useDashboardSeries } from '../../hooks/useDashboardSeries';
import { PieChartIcon, BarChartIcon, LayoutGrid, BarChart3, Clock, Trophy, Euro, TrendingUp, Gift, DollarSign, Hourglass, Award, Library, CalendarDays } from 'lucide-react';
import { GameFilters } from '../../types/game';
import { generatePlatformDistributionData, generateGenreDistributionData, findStalledGames, findNearPlatinum, countCompletedInYear } from '../../utils/gamesUtils';
import { useGamesStats } from '../../store/hooks/gamesHooks';
import { useAllGames } from '../../store/hooks/gamesHooks';
import { useRecentActivities } from '../../store/hooks/activitiesHooks';
import { useStatusData } from '../../store/hooks/gamesHooks';
import AnimatedPage from '../../components/ui/AnimatedPage';
import ActivitiesHistoryPopover from '../../components/ui/activities/ActivitiesHistoryPopover';
import { History } from 'lucide-react';


export default function DashboardPage() {
    const { stats, loading, error } = useGamesStats();
    const allGames = useAllGames();
    const { activities: recentActivities, loading: recentLoading } = useRecentActivities(4);
    const StatusData = useStatusData();
    const [showAllActivities, setShowAllActivities] = React.useState(false);
    const navigate = useNavigate();
    const series = useDashboardSeries();

    const year = new Date().getFullYear();
    const completedThisYear = React.useMemo(() => countCompletedInYear(allGames, year), [allGames, year]);
    const stalledGames = React.useMemo(() => findStalledGames(allGames), [allGames]);
    const nearPlatinum = React.useMemo(() => findNearPlatinum(allGames), [allGames]);

    // I grafici aprono la libreria già filtrata
    const openLibrary = (filters: Partial<GameFilters>) => navigate('/library', { state: { filters } });

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
            </div>            {/* Statistiche Rapide con animazioni */}
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
                        onSelect={status => openLibrary({ Status: [status as GameFilters['Status'][number]] })}
                    />
                </div>
                <div className="animate-fade-in-up delay-500">
                    <div className="bg-primary-bg p-6 shadow-sm rounded-lg border border-border-color hover:shadow-lg hover:border-accent-primary/30">
                        <div className="flex items-baseline justify-between mb-6">
                          <h2 className="text-xl font-bold text-text-primary font-['Montserrat'] flex items-center">
                            <Clock className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />
                            Attività Recente
                          </h2>
                          <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setShowAllActivities(true)}>
                            <History className="h-6 w-6 text-text-secondary group-hover:text-accent-primary transition-colors" />
                            <span className="text-sm text-text-secondary mt-0.5 font-secondary group-hover:text-accent-primary transition-colors">Cronologia completa</span>
                          </div>                    
                        </div>                    
                        {showAllActivities && (
                          <ActivitiesHistoryPopover
                            onClose={() => setShowAllActivities(false)}
                          />
                        )}
                        <RecentActivitiesList 
                          activities={recentActivities.slice(0, 4)} 
                          icon={undefined}
                          title={''}
                        />
                    </div>
                </div>
            </div>
            {/* Andamento nel tempo */}
            {series && (
                <>
                <div className="mb-6 animate-fade-in-up">
                    <PlayHeatmap
                        data={series.hoursPerDay}
                        title="Giorni giocati"
                        icon={<CalendarDays className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                    />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6 animate-fade-in-up">
                    <MonthlyChart
                        kind="bar"
                        data={series.hoursPerMonth}
                        unit="ore"
                        title="Ore giocate per mese"
                        icon={<Clock className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                        emptyMessage="Le ore si contano dalle sessioni registrate: appariranno dopo la prossima sincronizzazione o aggiornamento delle ore."
                    />
                    <MonthlyChart
                        kind="line"
                        data={series.backlogTrend}
                        unit="giochi da iniziare"
                        title="Andamento del backlog"
                        icon={<Library className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                        emptyMessage="Nessun gioco da iniziare negli ultimi 12 mesi."
                    />
                </div>
                </>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 animate-fade-in-up">
                <YearlyGoalCard completed={completedThisYear} year={year} />
                <GameHighlightList
                    title="Fermi da un po'"
                    icon={<Hourglass className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                    items={stalledGames.slice(0, 5).map(({ game, daysIdle }) => ({ game, detail: `${daysIdle} giorni` }))}
                    emptyMessage="Nessun gioco in corso è fermo da più di una settimana."
                />
                <GameHighlightList
                    title="Vicini al Platino"
                    icon={<Award className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                    items={nearPlatinum.map(({ game, percent }) => ({ game, detail: `${game.AchievementsUnlocked}/${game.AchievementsTotal} · ${percent}%` }))}
                    emptyMessage="Nessun gioco Steam con achievement parziali."
                />
            </div>{/* Grafici Secondari con animazioni */}
            <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="animate-fade-in-up delay-600">
                    <GenreBarChart 
                        data={genreData} 
                        icon={<BarChart3 className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                        title="Generi più giocati" 
                        onSelect={genre => openLibrary({ genre: [genre] })}
                    />
                </div>
                <div className="animate-fade-in-up delay-700">
                    <PlatformBarChart 
                        data={PlatformData} 
                        icon={<BarChartIcon className="h-5 w-5 text-accent-primary mr-2 drop-shadow-lg" />}
                        title="Piattaforme più utilizzate" 
                        onSelect={platform => openLibrary({ Platform: [platform] })}
                    />
                </div>
            </div>
            {/* Statistiche sui Prezzi */}
            <div className="bg-primary-bg p-6 rounded-lg shadow-sm mb-6 animate-fade-in-up delay-600">
                <h2 className="text-2xl font-bold text-text-primary font-['Montserrat'] mb-4">
                    <Euro className="inline h-6 w-6 text-accent-primary mr-2" />
                    Statistiche Economiche
                </h2>                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="animate-fade-in-up delay-700">
                        <StatsCard 
                            label="Spesa Totale" 
                            value={loading ? "..." : ('€' + Number(stats.totalSpent).toFixed(2)).toString()} 
                            icon={<Euro className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                        />
                    </div>
                    <div className="animate-fade-in-up delay-800">
                        <StatsCard 
                            label="Prezzo Medio" 
                            value={loading ? "..." : ('€' + Number(stats.averagePrice).toFixed(2)).toString()} 
                            icon={<TrendingUp className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                        />
                    </div>
                    <div className="animate-fade-in-up delay-1100">
                        <StatsCard 
                            label="Costo per Ora" 
                            value={loading ? "..." : ('€' + Number(stats.costPerHour).toFixed(2)).toString()} 
                            icon={<Clock className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                        />
                    </div>
                    <div className="animate-fade-in-up delay-900">
                        <StatsCard 
                            label="Giochi Gratuiti" 
                            value={loading ? "..." : stats.freeGames.toString()} 
                            icon={<Gift className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                        />
                    </div>
                    <div className="animate-fade-in-up delay-1000">
                        <StatsCard 
                            label="Prezzo Più Alto" 
                            value={loading ? "..." : ('€' + Number(stats.highestPrice).toFixed(2)).toString()} 
                            subtitle={loading ? undefined : stats.highestPriceGameTitle ? stats.highestPriceGameTitle : undefined}
                            icon={<DollarSign className="h-6 w-6 text-accent-primary drop-shadow-lg" />} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}