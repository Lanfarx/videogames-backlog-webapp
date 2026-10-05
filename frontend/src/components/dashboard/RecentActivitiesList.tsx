import React, { ReactNode, useState, useEffect } from 'react';
import { Activity } from '../../types/activity';
import ActivityCard from '../ui/ActivityCard';

interface RecentActivitiesListProps {
    activities: Activity[];
    icon?: ReactNode;
    title: string;
}

export default function RecentActivitiesList({ activities, icon, title }: RecentActivitiesListProps) {
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
                        <h3 className="font-montserrat font-semibold text-xl text-text-primary">
                            {title}
                        </h3>
                    )}
                </div>
            )}

            {/* Lista delle attività */}
            {activities.length === 0 ? (
                <div className="p-8 text-center">
                    <div className="text-text-secondary text-sm">Nessuna attività recente</div>
                </div>
            ) : (
                <>
                    {activities.map((activity, index) => {
                        // Calcola il delay per l'animazione staggered
                        const delay = index * 80;
                        const shouldShow = animationProgress >= (index / activities.length);
                        
                        // Stili per l'animazione fluida (senza rimbalzo)
                        const animationStyle = {
                            opacity: shouldShow ? 1 : 0,
                            transform: shouldShow 
                                ? 'translateY(0)' 
                                : 'translateY(12px)',
                            transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
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
}
