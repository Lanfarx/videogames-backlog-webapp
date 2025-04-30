import { getRecentActivities } from '../../utils/activitiesData';
import { getStatusColor } from '../../utils/statusData';
import ActivityCard from '../ui/ActivityCard';

export default function RecentActivitiesSection() {
  // Ottengo le attività recenti usando la funzione importata
  const recentActivities = getRecentActivities(5);
  
  return (
    <section className="mb-10">
      {/* Intestazione */}
      <div className='container mx-auto px-6 py-8'> 
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-text-primary font-primary">Attività recenti</h2>
            <p className="text-sm text-text-secondary mt-0.5 font-secondary">Le tue ultime azioni nella libreria</p>
          </div>
        </div>

        <div className="relative mt-6 pb-4">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-accent-light-success transform -translate-x-1/2 z-0"></div>

          {/* Activities */}
          <div className="space-y-12 relative">
            {recentActivities.map((activity, index) => {
              // Determina se l'attività è a sinistra o a destra
              const position = index % 2 === 0 ? 'right' : 'left';
              // Ottengo il colore dalla utility centralizzata
              const dotColor = getStatusColor(activity.type);
              
              return (
                <div key={activity.id} className="relative min-h-[60px] flex items-center">
                  {/* Timeline dot con colore basato sul tipo di attività */}
                  <div 
                    className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ backgroundColor: dotColor }}
                  ></div>

                  {/* Activity card - posizionato a sinistra o destra */}
                  <div className={`w-5/12 ${position === 'right' ? "ml-auto pl-5" : "mr-auto pr-5"}`}>
                    <ActivityCard 
                      activity={activity}
                      position={position}
                      showIcon={true}
                    />
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