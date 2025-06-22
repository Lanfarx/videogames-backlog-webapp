import React, { ReactNode, useState, useEffect } from 'react';
import { Activity } from '../../types/activity';
import ActivityCard from '../ui/ActivityCard';

interface RecentActivitiesListProps {
    activities: Activity[];
    icon?: ReactNode;
    title: string;
}

const RecentActivitiesList: React.FC<RecentActivitiesListProps> = ({ activities, icon, title }) => {
    const [animationProgress, setAnimationProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Intersection Observer per avviare l'animazione
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Animazione staggered per le attività
    useEffect(() => {
        if (!isVisible) return;

        const duration = 800;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            setAnimationProgress(progress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }, [isVisible]);    return (
        <div ref={containerRef} className="space-y-4">
            {/* Header con titolo e icona */}
            {(title || icon) && (
                <div className="flex items-center gap-3 mb-6">
                    {icon && (
                        <div className="flex items-center justify-center text-accent-primary animate-float">
                            {icon}
                        </div>
                    )}                    {title && (
                        <h3 className="font-bold text-xl font-secondary bg-gradient-to-r from-text-primary via-accent-primary to-text-primary bg-clip-text text-transparent bg-[size:200%] animate-gradient-x">
                            {title}
                        </h3>
                    )}
                </div>
            )}

            {/* Lista delle attività */}
            {activities.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="text-text-secondary text-sm animate-pulse">Nessuna attività recente</div>
                </div>
            ) : (
                <>
                    {activities.map((activity, index) => {
                        // Calcola il delay per l'animazione staggered
                        const delay = index * 100;
                        const shouldShow = animationProgress >= (index / activities.length);
                        
                        // Stili per l'animazione
                        const animationStyle = {
                            opacity: shouldShow ? 1 : 0,
                            transform: shouldShow 
                                ? 'translateY(0) scale(1)' 
                                : 'translateY(20px) scale(0.95)',
                            transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms`,
                        };                        return (
                            <div
                                key={`${activity.gameTitle}-${activity.timestamp}-${index}`}
                                style={animationStyle}
                            >                                <ActivityCard
                                    activity={activity}
                                    position="left"
                                    showIcon={true}
                                    compact={false}
                                    className="group/activity hover:scale-[1.02] hover:shadow-xl hover:border-accent-primary/50"
                                />
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );
};

export default RecentActivitiesList;
