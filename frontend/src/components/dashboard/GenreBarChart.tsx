import React, { ReactNode, useState, useEffect } from 'react';

interface GenreData {
    genre: string;
    count: number;
}

interface GenreBarChartProps {
    data: GenreData[];
    icon?: ReactNode;
    title: string;
}

const GenreBarChart: React.FC<GenreBarChartProps> = ({ data, icon, title }) => {
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
            { threshold: 0.3 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Animazione delle barre
    useEffect(() => {
        if (!isVisible) return;

        const duration = 1400;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            setAnimationProgress(easeOutExpo(progress));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isVisible]);

    // Colori dinamici per i generi
    const getBarColor = (index: number) => {
        const colors = [
            '#FF6B6B', // Red
            '#4ECDC4', // Teal
            '#45B7D1', // Blue
            '#FFA07A', // Light Salmon
            '#98D8C8', // Mint
            '#F7DC6F', // Yellow
            '#BB8FCE', // Purple
            '#85C1E9', // Light Blue
            '#F8C471', // Orange
            '#82E0AA'  // Light Green
        ];
        return colors[index % colors.length];
    };

    return (
        <div 
            ref={containerRef}
            className="bg-primary-bg p-6 rounded-lg shadow-sm border border-border-color hover:shadow-lg hover:border-accent-primary/30 transition-all duration-300"
        >
            <h2 className="text-xl font-bold text-text-primary mb-6 font-['Montserrat'] flex items-center">
                {icon}
                {title}
            </h2>
            <div className="space-y-4">
                {data.slice(0, 8).map((item, index) => {
                    const maxCount = Math.max(...data.map(i => i.count));
                    const widthPercentage = (item.count / maxCount) * 100;
                    const animatedWidth = widthPercentage * animationProgress;
                    const barColor = getBarColor(index);
                    const delay = index * 120;
                    
                    return (
                        <div 
                            key={index} 
                            className="w-full group cursor-pointer"
                            style={{
                                opacity: animationProgress > (index * 0.12) ? 1 : 0,
                                transform: `translateX(${animationProgress > (index * 0.12) ? 0 : -30}px)`,
                                transition: `all 0.6s ease-out ${delay}ms`
                            }}
                        >
                            <div className="flex justify-between items-center text-sm text-text-primary mb-2 font-['Roboto']">
                                <span className="font-medium group-hover:text-accent-primary transition-colors capitalize">
                                    {item.genre}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-accent-primary">
                                        {Math.round(item.count * animationProgress)}
                                    </span>
                                    <div className="text-xs text-text-secondary">
                                        ({Math.round((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100)}%)
                                    </div>
                                </div>
                            </div>
                            <div className="relative w-full bg-tertiary-bg h-4 rounded-full overflow-hidden shadow-inner">
                                {/* Barra animata con gradiente */}
                                <div 
                                    className="h-full rounded-full transition-all duration-500 group-hover:scale-y-110 group-hover:shadow-lg relative overflow-hidden"
                                    style={{ 
                                        width: `${animatedWidth}%`,
                                        background: `linear-gradient(135deg, ${barColor}, ${barColor}E6, ${barColor}CC)`,
                                        boxShadow: `0 2px 8px ${barColor}30, inset 0 1px 2px rgba(255,255,255,0.1)`
                                    }}
                                >
                                    {/* Pattern decorativo */}
                                    <div 
                                        className="absolute inset-0 opacity-20"
                                        style={{
                                            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)'
                                        }}
                                    />
                                    
                                    {/* Effetto glow al termine dell'animazione */}
                                    {animationProgress > 0.9 && (
                                        <div 
                                            className="absolute right-0 top-0 w-2 h-full animate-pulse"
                                            style={{
                                                background: `linear-gradient(to right, transparent, ${barColor}`,
                                                filter: 'blur(1px)'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {/* Mostra un indicatore se ci sono più generi */}
                {data.length > 8 && (
                    <div className="text-center pt-2">
                        <span className="text-xs text-text-secondary font-['Roboto']">
                            +{data.length - 8} altri generi
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenreBarChart;
