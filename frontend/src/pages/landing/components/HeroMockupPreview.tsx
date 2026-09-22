import { useState } from 'react';
import { Trophy, Clock, Star, Sparkles, Filter } from 'lucide-react';
import { SAMPLE_GAMES, SampleGame } from '../landingData';
import { getStatusColor, getStatusLabel, getPlatformColor } from '../../../constants/gameConstants';

type TabKey = 'all' | 'InProgress' | 'Platinum' | 'NotStarted' | 'Abandoned';

export default function HeroMockupPreview() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const filteredGames = SAMPLE_GAMES.filter((game: SampleGame) => {
    if (activeTab === 'all') return true;
    return game.status === activeTab;
  });

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
      {/* Decorative ambient gradient backing */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-accent-primary/30 to-accent-secondary/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

      {/* Main mockup card frame */}
      <div className="relative rounded-2xl border border-border-color/80 bg-secondary-bg/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Window Chrome Header */}
        <div className="px-5 py-3.5 border-b border-border-color/70 bg-tertiary-bg/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            <span className="ml-2 text-xs font-medium text-text-secondary font-secondary">
              GameBacklog • Dashboard Live Demo
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-text-secondary">
            <Sparkles className="w-3.5 h-3.5 text-accent-secondary" />
            <span className="hidden sm:inline">Anteprima Interattiva</span>
          </div>
        </div>

        {/* Mockup Toolbar: Filter tabs */}
        <div className="p-4 border-b border-border-color/60 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-text-secondary mr-1 hidden sm:inline" />
            {tabOptions.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 border ${
                    isActive
                      ? 'bg-accent-primary text-white border-accent-primary shadow-sm font-semibold'
                      : 'bg-primary-bg/80 border-border-color/80 text-text-secondary hover:text-accent-primary hover:border-accent-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-secondary-bg text-text-secondary border border-border-color/40'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mockup Game List */}
        <div className="p-4 space-y-3 max-h-[360px] overflow-y-auto custom-scrollbar">
          {filteredGames.map((game) => {
            const statusColor = getStatusColor(game.status);
            const statusLabel = getStatusLabel(game.status);
            const platformColor = getPlatformColor(game.platform);

            return (
              <div
                key={game.id}
                className="group relative p-3 rounded-xl bg-primary-bg/70 border border-border-color/60 hover:border-accent-primary/60 hover:shadow-md transition-all duration-200 flex items-center space-x-3.5"
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-tertiary-bg border border-border-color/40">
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {game.status === 'Platinum' && (
                    <div className="absolute top-1 right-1 bg-purple-600/90 text-white rounded p-0.5 shadow">
                      <Trophy className="w-3 h-3" />
                    </div>
                  )}
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

                  <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
                    <span className="truncate">{game.genre}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-text-secondary" />
                      <span className="font-mono tabular-nums">{game.hoursPlayed}h</span>
                    </div>
                  </div>

                  {/* Progress Bar & Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 bg-tertiary-bg rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${game.progressPercent}%`,
                          backgroundColor: statusColor,
                        }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: `${statusColor}18`,
                        color: statusColor,
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info strip */}
        <div className="px-5 py-3 bg-tertiary-bg/40 border-t border-border-color/60 flex items-center justify-between text-xs text-text-secondary font-secondary">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-accent-primary" />
              <span>346h complessive</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Trophy className="w-3.5 h-3.5 text-purple-500" />
              <span>1 Platino</span>
            </span>
          </div>

          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3 fill-amber-400 text-amber-400"
              />
            ))}
            <span className="ml-1 font-semibold text-text-primary text-[11px]">4.9 / 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
