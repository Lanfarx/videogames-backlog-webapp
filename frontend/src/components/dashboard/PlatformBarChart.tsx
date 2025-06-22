import React, { ReactNode, useState, useEffect } from 'react';

interface PlatformData {
    Platform: string;
    count: number;
}

interface PlatformBarChartProps {
    data: PlatformData[];
    icon?: ReactNode;
    title: string;
}

const PlatformBarChart: React.FC<PlatformBarChartProps> = ({ data, icon, title }) => {
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

        const duration = 1200;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
            setAnimationProgress(easeOutQuart(progress));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isVisible]);

    // Colori dinamici per le piattaforme
    const getBarColor = (index: number) => {
        const colors = [
            '#3B82F6', // Blue
            '#10B981', // Green  
            '#F59E0B', // Yellow
            '#EF4444', // Red
            '#8B5CF6', // Purple
            '#06B6D4', // Cyan
            '#F97316', // Orange
            '#84CC16'  // Lime
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
                {data.map((item, index) => {
                    const maxCount = Math.max(...data.map(i => i.count));
                    const widthPercentage = (item.count / maxCount) * 100;
                    const animatedWidth = widthPercentage * animationProgress;
                    const barColor = getBarColor(index);
                    const delay = index * 150;
                    
                    return (
                        <div 
                            key={index} 
                            className="w-full group"
                            style={{
                                opacity: animationProgress > (index * 0.15) ? 1 : 0,
                                transform: `translateY(${animationProgress > (index * 0.15) ? 0 : 20}px)`,
                                transition: `all 0.5s ease-out ${delay}ms`
                            }}
                        >
                            <div className="flex justify-between items-center text-sm text-text-primary mb-2 font-['Roboto']">
                                <span className="font-medium group-hover:text-accent-primary transition-colors">
                                    {item.Platform}
                                </span>
                                <span className="font-bold text-accent-primary">
                                    {Math.round(item.count * animationProgress)}
                                </span>
                            </div>
                            <div className="relative w-full bg-tertiary-bg h-4 rounded-full overflow-hidden shadow-inner">
                                {/* Barra animata con gradiente */}
                                <div 
                                    className="h-full rounded-full transition-all duration-300 group-hover:scale-y-110 relative overflow-hidden"
                                    style={{ 
                                        width: `${animatedWidth}%`,
                                        background: `linear-gradient(90deg, ${barColor}, ${barColor}CC)`,
                                        boxShadow: `0 0 12px ${barColor}40`
                                    }}
                                >
                                    {/* Effetto shimmer */}
                                    <div 
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                                        style={{
                                            transform: `translateX(-100%)`,
                                            animation: animationProgress > 0.8 ? 'shimmer 2s ease-in-out infinite' : 'none'
                                        }}
                                    />
                                </div>
                                
                                {/* Indicatore di percentuale */}
                                <div 
                                    className="absolute top-0 right-2 h-full flex items-center text-xs font-semibold text-white drop-shadow-sm"
                                    style={{ opacity: animatedWidth > 25 ? 1 : 0 }}
                                >
                                    {Math.round((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlatformBarChart;
