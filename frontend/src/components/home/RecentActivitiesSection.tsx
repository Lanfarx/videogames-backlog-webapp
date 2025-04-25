import React from 'react';
import SectionHeader from '../ui/SectionHeader';
import { getRecentActivities, getActivityIcon, getActivityText, formatRelativeTime } from '../../hooks/activitiesData';

export default function RecentActivitiesSection() {
  // Ottengo le attività recenti usando la funzione importata
  const recentActivities = getRecentActivities(5);
    
  return (
    <section className="mb-12">
      <SectionHeader
        title="Attività recenti"
        subtitle="Le tue ultime azioni nella libreria"
        seeAllLink="/activities"
      />

      <div className="relative mt-8 pb-6">
        {/* Timeline line - usando un colore definito in Tailwind */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#D1DFD2] transform -translate-x-1/2 z-0"></div>

        {/* Activities */}
        <div className="space-y-12 relative">
          {recentActivities.map((activity, index) => {
            // Recupero l'icona per questo tipo di attività
            const icon = getActivityIcon(activity.type);
            // Genero il testo dell'attività
            const activityText = getActivityText(activity);
            // Formatto il timestamp
            const formattedTimestamp = formatRelativeTime(activity.timestamp);
            
            return (
              <div key={activity.id} className="relative min-h-[64px] flex items-center">
                {/* Timeline dot - migliorato contrasto e dimensione */}
                <div className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-[#FB7E00] transform -translate-x-1/2 -translate-y-1/2 z-10"></div>

                {/* Activity box - migliorato allineamento */}
                <div className={`w-5/12 ${index % 2 === 0 ? "ml-auto pl-8" : "mr-auto pr-8"}`}>
                  <div className="bg-white border border-[#E0E0E0] rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-sm text-[#222222] font-medium">{activityText}</p>
                      <p className="text-xs text-[#666666] mt-1">{formattedTimestamp}</p>
                    </div>
                    <div className="text-[#9FC089] ml-4 flex-shrink-0">
                      {icon}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}