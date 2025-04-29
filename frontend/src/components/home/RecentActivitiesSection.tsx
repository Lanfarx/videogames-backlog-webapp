import React from 'react';
import { getRecentActivities, getActivityIcon, getActivityText, formatRelativeTime } from '../../utils/activitiesData';

export default function RecentActivitiesSection() {
  // Ottengo le attività recenti usando la funzione importata
  const recentActivities = getRecentActivities(5);
    
  return (
    <section className="mb-12">
      {/* Intestazione incorporata direttamente (ex-SectionHeader) */}
      <div className='container mx-auto px-6 py-8'> 
      <div className="flex items-baseline justify-between mb-4 ">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary font-primary">Attività recenti</h2>
          <p className="text-sm text-text-secondary mt-1 font-secondary">Le tue ultime azioni nella libreria</p>
        </div>
      </div>

      <div className="relative mt-8 pb-6">
        {/* Timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-accent-light-success transform -translate-x-1/2 z-0"></div>

        {/* Activities */}
        <div className="space-y-16 relative">
          {recentActivities.map((activity, index) => {
            // Recupero l'icona per questo tipo di attività
            const icon = getActivityIcon(activity.type);
            // Genero il testo dell'attività
            const activityText = getActivityText(activity);
            // Formatto il timestamp
            const formattedTimestamp = formatRelativeTime(activity.timestamp);
            
            return (
              <div key={activity.id} className="relative min-h-[80px] flex items-center">
                {/* Timeline dot */}
                <div className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-accent-primary transform -translate-x-1/2 -translate-y-1/2 z-10"></div>

                {/* Activity box - ridotto il padding laterale */}
                <div className={`w-5/12 ${index % 2 === 0 ? "ml-auto pl-6" : "mr-auto pr-6"}`}>
                  <div className="bg-primaryBg border border-border-color rounded-lg p-5 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-grow">
                      <p className="text-base text-text-primary font-medium font-secondary">{activityText}</p>
                      <p className="text-sm text-text-secondary mt-2">{formattedTimestamp}</p>
                    </div>
                    <div className="text-accent-success ml-5 flex-shrink-0">
                      {React.cloneElement(icon, { className: 'h-6 w-6' })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}