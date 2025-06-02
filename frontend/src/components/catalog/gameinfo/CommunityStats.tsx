import React from "react";
import { Users, Clock, Trophy, Gamepad2 } from "lucide-react";
import { useCommunityStatsByGameAggregated } from "../../../store/hooks/communityHooks";

interface CommunityStatsProps {
  GameTitle: string;
}

const CommunityStats: React.FC<CommunityStatsProps> = ({ GameTitle }) => {
  const stats = useCommunityStatsByGameAggregated(GameTitle);

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl px-8 py-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Giocatori totali */}
        <div className="flex flex-col items-center flex-1 min-w-[120px]">
          <Users className="h-7 w-7 text-accent-primary mb-1" />
          <div className="text-2xl font-bold text-text-primary">
            {stats.totalPlayers}
          </div>
          <div className="text-sm text-text-secondary mt-1 text-center">
            Giocatori totali
          </div>
        </div>
        {/* Tempo medio */}
        <div className="flex flex-col items-center flex-1 min-w-[120px]">
          <Clock className="h-7 w-7 text-accent-primary mb-1" />
          <div className="text-2xl font-bold text-text-primary">
            {stats.averagePlaytime}h
          </div>
          <div className="text-sm text-text-secondary mt-1 text-center">
            Tempo medio
          </div>
        </div>
        {/* Tasso di completamento */}
        <div className="flex flex-col items-center flex-1 min-w-[120px]">
          <Trophy className="h-7 w-7 text-accent-primary mb-1" />
          <div className="text-2xl font-bold text-text-primary">
            {stats.completionRate}%
          </div>
          <div className="text-sm text-text-secondary mt-1 text-center">
            Tasso completamento
          </div>
        </div>
        {/* Stanno giocando ora */}
        <div className="flex flex-col items-center flex-1 min-w-[120px]">
          <Gamepad2 className="h-7 w-7 text-accent-primary mb-1" />
          <div className="text-2xl font-bold text-text-primary">
            {stats.currentlyPlaying}
          </div>
          <div className="text-sm text-text-secondary mt-1 text-center">
            Stanno giocando
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityStats;
