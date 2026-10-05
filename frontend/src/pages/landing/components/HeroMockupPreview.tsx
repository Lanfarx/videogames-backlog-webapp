import { useState, useMemo } from 'react';
import { Clock, Star, Sparkles, Filter, Award, ChevronRight, MessageSquare, Monitor } from 'lucide-react';
import { SAMPLE_GAMES, SampleGame } from '../landingData';
import { getStatusColor, getStatusLabel, getPlatformColor } from '../../../constants/gameConstants';

type TabKey = 'all' | 'InProgress' | 'Platinum' | 'Completed' | 'NotStarted' | 'Abandoned';

export default function HeroMockupPreview() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const [selectedGameId, setSelectedGameId] = useState<number | null>(1);

  const platforms = useMemo(() => {
    const list = Array.from(new Set(SAMPLE_GAMES.map((g) => g.platform)));
    return ['all', ...list];
  }, []);

  const filteredGames = useMemo(() => {
    return SAMPLE_GAMES.filter((game: SampleGame) => {
      const matchStatus = activeTab === 'all' || game.status === activeTab;
      const matchPlatform = activePlatform === 'all' || game.platform === activePlatform;
      return matchStatus && matchPlatform;
    });
  }, [activeTab, activePlatform]);

  const stats = useMemo(() => {
    const totalHours = filteredGames.reduce((acc, g) => acc + g.hoursPlayed, 0);
    const avgMetacritic = filteredGames.length > 0
      ? Math.round(filteredGames.reduce((acc, g) => acc + g.metacritic, 0) / filteredGames.length)
      : 0;
    return { totalHours, count: filteredGames.length, avgMetacritic };
  }, [filteredGames]);

  const tabOptions: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'Tutti', count: SAMPLE_GAMES.length },
    {
      key: 'InProgress',
      label: 'In corso',
      count: SAMPLE_GAMES.filter((g) => g.status === 'InProgress').length,
    },
    {
      key: 'Platinum',
      label: 'Platinati',
      count: SAMPLE_GAMES.filter((g) => g.status === 'Platinum').length,
    },
    {
      key: 'Completed',
      label: 'Completati',
      count: SAMPLE_GAMES.filter((g) => g.status === 'Completed').length,
    },
    {
      key: 'NotStarted',
      label: 'Da iniziare',
      count: SAMPLE_GAMES.filter((g) => g.status === 'NotStarted').length,
    },
    {
      key: 'Abandoned',
      label: 'Abbandonati',
      count: SAMPLE_GAMES.filter((g) => g.status === 'Abandoned').length,
    },
  ];

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Decorative ambient background */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-accent-primary/20 via-purple-600/15 to-accent-secondary/20 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-700 -z-10" />

      {/* Main mockup card frame */}
      <div className="relative rounded-2xl border border-border-color bg-secondary-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Window Chrome Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-border-color bg-tertiary-bg/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            <span className="ml-2 text-xs font-semibold text-text-primary font-secondary">
              GameBacklog • Dashboard Live Demo
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-accent-primary font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anteprima Interattiva</span>
          </div>
        </div>

        {/* Primary Filter Tabs: Game Status */}
        <div className="p-3 sm:p-4 border-b border-border-color/70 bg-primary-bg/50">
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {tabOptions.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={isActive}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex items-center space-x-2 border flex-shrink-0 ${
                    isActive
                      ? 'bg-accent-primary text-white border-accent-primary shadow-sm font-semibold'
                      : 'bg-secondary-bg border-border-color text-text-secondary hover:text-text-primary hover:border-accent-primary/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-tertiary-bg text-text-secondary border border-border-color/50'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filter: Platform toggle pills */}
          <div className="flex items-center gap-1.5 pt-2.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1 mr-1 flex-shrink-0">
              <Filter className="w-3 h-3 text-text-secondary" />
              Piattaforma:
            </span>
            {platforms.map((p) => {
              const isSelected = activePlatform === p;
              const label = p === 'all' ? 'Tutte' : p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePlatform(p)}
                  aria-pressed={isSelected}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors flex-shrink-0 ${
                    isSelected
                      ? 'bg-text-primary text-primary-bg font-semibold'
                      : 'bg-tertiary-bg/70 text-text-secondary hover:text-text-primary border border-border-color/60'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mockup Game List & Detail Area */}
        <div className="p-3 sm:p-4 space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar">
          {filteredGames.length === 0 ? (
            <div className="py-8 text-center text-text-secondary text-sm">
              Nessun gioco trovato con i filtri selezionati.
            </div>
          ) : (
            filteredGames.map((game) => {
              const isSelected = selectedGameId === game.id;
              const statusColor = getStatusColor(game.status);
              const statusLabel = getStatusLabel(game.status);
              const platformColor = getPlatformColor(game.platform);

              return (
                <div
                  key={game.id}
                  onClick={() => setSelectedGameId(isSelected ? null : game.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedGameId(isSelected ? null : game.id);
                    }
                  }}
                  className={`group relative p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-primary-bg border-accent-primary ring-1 ring-accent-primary/50 shadow-md'
                      : 'bg-primary-bg/80 border-border-color hover:border-accent-primary/60 hover:-translate-y-0.5 shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Cover Thumbnail with real game artwork */}
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-tertiary-bg border border-border-color shadow-sm">
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Info Center */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-sm font-bold text-text-primary truncate font-primary">
                          {game.title}
                        </h4>
                        {/* Platform Tag */}
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white flex-shrink-0"
                          style={{ backgroundColor: platformColor }}
                        >
                          {game.platform}
                        </span>
                      </div>

                      {/* Genre, Year, Hours & Metacritic */}
                      <div className="flex items-center justify-between text-xs text-text-secondary gap-2 mb-1.5 flex-wrap">
                        <span className="truncate">
                          {game.genre} • {game.releaseYear}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1 font-mono text-text-primary">
                            <Clock className="w-3 h-3 text-text-secondary" />
                            <span>{game.hoursPlayed} ore</span>
                          </span>
                          <span className="flex items-center space-x-1 text-emerald-500 font-mono font-semibold">
                            <Award className="w-3 h-3 text-yellow-500" />
                            <span>{game.metacritic}</span>
                          </span>
                        </div>
                      </div>

                      {/* Status Pill & Personal Rating */}
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: `${statusColor}18`,
                            color: statusColor,
                          }}
                        >
                          {statusLabel}
                        </span>

                        <div className="flex items-center space-x-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(game.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-border-color'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Expand Indicator */}
                    <div className="text-text-secondary group-hover:text-accent-primary transition-colors flex-shrink-0">
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'rotate-90 text-accent-primary' : ''}`} />
                    </div>
                  </div>

                  {/* Inline Inspector with Notes & Details when selected */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-border-color/80 space-y-2 text-xs">
                      {game.notes && (
                        <div className="p-2.5 rounded-lg bg-secondary-bg/80 border border-border-color/60 text-text-secondary text-[11px] leading-relaxed flex items-start gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-accent-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-text-primary block mb-0.5 font-secondary">Nota Personale:</span>
                            <span>"{game.notes}"</span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-secondary-bg/60 border border-border-color/60 flex items-center justify-between">
                          <span className="text-text-secondary">Piattaforma:</span>
                          <span className="font-medium text-text-primary flex items-center gap-1">
                            <Monitor className="w-3 h-3 text-accent-primary" />
                            {game.platform}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-secondary-bg/60 border border-border-color/60 flex items-center justify-between">
                          <span className="text-text-secondary">Metacritic Ufficiale:</span>
                          <span className="font-mono font-bold text-emerald-500">
                            {game.metacritic}/100
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Real Live Metrics Footer */}
        <div className="px-4 sm:px-5 py-3 bg-tertiary-bg/70 border-t border-border-color flex flex-wrap items-center justify-between gap-3 text-xs font-secondary">
          <div className="flex items-center space-x-3 text-text-secondary">
            <span className="flex items-center space-x-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-accent-primary" />
              <span className="text-text-primary font-semibold font-mono tabular-nums">{stats.totalHours} ore</span>
              <span className="hidden sm:inline">registrate</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1 font-medium">
              <span className="text-text-primary font-semibold font-mono tabular-nums">{stats.count}</span>
              <span>giochi</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1 font-medium">
              <Award className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-text-primary font-semibold font-mono tabular-nums">{stats.avgMetacritic}</span>
              <span className="hidden sm:inline">Metacritic medio</span>
            </span>
          </div>

          <div className="text-[11px] text-text-secondary">
            Filtra e organizza in tempo reale
          </div>
        </div>
      </div>
    </div>
  );
}
