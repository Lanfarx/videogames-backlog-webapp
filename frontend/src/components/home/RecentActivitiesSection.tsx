import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecentActivities } from '../../store/hooks/activitiesHooks';
import { getActivityColor } from '../../constants/gameConstants';
import ActivityCard from '../ui/ActivityCard';
import AllActivitiesHistoryPopover from '../ui/AllActivitiesHistoryPopover';
import {History } from 'lucide-react';

export default function RecentActivitiesSection() {
  const navigate = useNavigate();
  const { activities: recentActivities, loading: recentLoading } = useRecentActivities(5);
  const [showHistory, setShowHistory] = useState(false);

  // Mostra loading se necessario
  if (recentLoading) {
    return (
      <section className="mb-10">
        <div className='container mx-auto px-6 py-8'>
          <h2 className="text-2xl font-semibold text-text-primary font-primary mb-4">Attività recenti</h2>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  // Controlla se non ci sono attività
  if (!recentActivities || recentActivities.length === 0) {
    return (
      <section className="mb-10">
        <div className='container mx-auto px-6 py-8'>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text-primary font-primary">Attività recenti</h2>
            <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setShowHistory(true)}>
              <History className="h-6 w-6 text-text-secondary group-hover:text-accent-primary transition-colors" />
              <span className="text-sm text-text-secondary mt-0.5 font-secondary group-hover:text-accent-primary transition-colors">Cronologia completa</span>
            </div>
          </div>
          
          {/* Timeline vuota con messaggio personalizzato */}
          <div className="relative">
            {/* Timeline line ridotta */}
            <div className="absolute left-1/2 top-8 bottom-8 w-0.5 bg-accent-light-success/30 transform -translate-x-1/2 z-0"></div>
            
            {/* Messaggio vuoto al centro della timeline */}
            <div className="relative flex justify-center py-12">
              <div className="bg-surface-secondary rounded-xl border border-accent-secondary/20 p-8 text-center max-w-md mx-auto z-10">
                <div className="text-6xl mb-4 opacity-50">📅</div>
                <h3 className="text-xl font-semibold text-text-primary mb-3 font-primary">Nessuna attività recente</h3>
                <p className="text-text-secondary mb-6 leading-relaxed font-secondary">
                  Non hai ancora registrato nessuna attività. Inizia a giocare e tieni traccia dei tuoi progressi!
                </p>
                <button 
                  onClick={() => navigate('/library')}
                  className="bg-accent-primary hover:bg-accent-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                >
                  Vai alla libreria
                </button>
              </div>
            </div>
          </div>

          {showHistory && (
            <AllActivitiesHistoryPopover
              onClose={() => setShowHistory(false)}
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {/* Intestazione */}
      <div className='container mx-auto px-6 py-8'> 
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-semibold text-text-primary font-primary">Attività recenti</h2>
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

        <div className="relative mt-6 pb-4">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-accent-light-success transform -translate-x-1/2 z-0"></div>

          {/* Activities */}
          <div className="space-y-12 relative">
            {recentActivities.map((activity, index) => {
              // Determina se l'attività è a sinistra o a destra
              const position = index % 2 === 0 ? 'right' : 'left';
              // Ottengo il colore dalla utility centralizzata
              const dotColor = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="relative min-h-[60px] flex items-center">
                  {/* Timeline dot con colore basato sul tipo di attività */}
                  <div 
                    className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ backgroundColor: dotColor }}
                  ></div>

                  {/* Activity card - posizionato a sinistra o a destra */}
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