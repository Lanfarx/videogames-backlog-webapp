import React, { useRef, useEffect, ReactNode, useState } from 'react';
import { getStatusColor } from '../../constants/gameConstants';

interface StatusDistributionChartProps {
    data: {
        Status: string;
        label: string;
        count: number;
        color?: string;
    }[];
    icon?: ReactNode;
    title: string;
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data, icon, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    
    // Filtra i dati per rimuovere gli elementi con count = 0
    const filteredData = data.filter(item => item.count > 0);
    const total = filteredData.reduce((sum, item) => sum + item.count, 0);

    // Intersection Observer per avviare l'animazione quando il componente è visibile
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (canvasRef.current) {
            observer.observe(canvasRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Animazione del grafico a torta
    useEffect(() => {
        if (!isVisible) return;

        const duration = 1500; // 1.5 secondi
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function per un'animazione più fluida
            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
            setAnimationProgress(easeOutCubic(progress));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isVisible]);

    useEffect(() => {
        if (!canvasRef.current || total === 0) return;
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        // Pulisci il canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Disegna il grafico a torta con animazione
        let startAngle = -Math.PI / 2; // Inizia dall'alto
        const centerX = canvasRef.current.width / 2;
        const centerY = canvasRef.current.height / 2;
        const radius = Math.min(centerX, centerY) - 15;        
        filteredData.forEach((item, index) => {
            if (item.count === 0) return;
            
            const sliceAngle = (item.count / total) * 2 * Math.PI * animationProgress;
            
            // Effetto glow per ogni sezione
            ctx.shadowColor = item.color || getStatusColor(item.Status);
            ctx.shadowBlur = 8;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            // Usa il colore definito nell'item con gradiente
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            const baseColor = item.color || getStatusColor(item.Status);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.7, baseColor);
            gradient.addColorStop(1, baseColor + '80'); // Trasparenza al bordo
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Reset shadow
            ctx.shadowBlur = 0;
            
            startAngle += (item.count / total) * 2 * Math.PI * animationProgress;        });        // Grafico completamente pieno senza donut centrale
    }, [filteredData, total, animationProgress]);    // Calcola percentuali con animazione
    const dataWithPercentage = filteredData.map((item, index) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        animatedPercentage: total > 0 ? Math.round((item.count / total) * 100 * animationProgress) : 0
    }));

    return (
        <div className="bg-primary-bg p-6 rounded-lg shadow-sm border border-border-color hover:shadow-lg hover:border-accent-primary/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary mb-6 font-['Montserrat'] flex items-center">
                {icon}
                {title}
            </h2>            <div className="flex">
                <div className="w-1/2 relative flex items-center justify-center">
                    <canvas ref={canvasRef} width={200} height={200} className="drop-shadow-lg" />
                </div>
                
                {/* Indicatore totale fuori dal grafico, a destra */}
                <div className="w-1/2 pl-4 flex flex-col">
                    <div className="text-center mb-4 p-3 bg-secondary-bg rounded-lg border border-border-color">
                        <div className="text-2xl font-bold font-['Montserrat'] text-accent-primary">
                            {Math.round(total * animationProgress)}
                        </div>
                        <div className="text-xs text-text-secondary font-['Roboto']">
                            Totali
                        </div>
                    </div>
                    
                    <div className="flex-1">
                    {dataWithPercentage.map((item, index) => {
                        const delay = index * 100;
                        return (
                            <div 
                                key={index} 
                                className="flex items-center justify-between mb-3 transform transition-all duration-300 hover:scale-105"
                                style={{ 
                                    animationDelay: `${delay}ms`,
                                    opacity: animationProgress > 0.5 ? 1 : 0,
                                    transform: `translateX(${animationProgress > 0.5 ? 0 : 20}px)`
                                }}
                            >
                                <div className="flex items-center">
                                    <div 
                                        className="w-4 h-4 mr-3 rounded-full transition-all duration-300 hover:scale-125" 
                                        style={{ 
                                            backgroundColor: item.color,
                                            boxShadow: `0 0 8px ${item.color}40`
                                        }}
                                    ></div>
                                    <span className="text-sm text-text-primary font-['Roboto'] font-medium">
                                        {item.label}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-accent-primary">
                                        {item.animatedPercentage}%
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                        {Math.round(item.count * animationProgress)}
                                    </div>
                                </div>
                            </div>                        );
                    })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatusDistributionChart;
