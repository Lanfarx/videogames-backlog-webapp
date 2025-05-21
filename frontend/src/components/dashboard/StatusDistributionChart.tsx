import React, { useRef, useEffect, ReactNode } from 'react';
import { StatusItem } from '../../utils/statusData';
import { getStatusColor } from '../../constants/gameConstants';

interface StatusDistributionChartProps {
    data: StatusItem[];
    icon?: ReactNode;
    title: string;
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data, icon, title }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const total = data.reduce((sum, item) => sum + item.count, 0);

    useEffect(() => {
        if (!canvasRef.current || total === 0) return;
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        
        // Pulisci il canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Disegna il grafico a torta
        let startAngle = 0;
        const centerX = canvasRef.current.width / 2;
        const centerY = canvasRef.current.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        data.forEach(item => {
            if (item.count === 0) return;
            
            const sliceAngle = (item.count / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            // Usa il colore definito nell'item
            ctx.fillStyle = item.color || getStatusColor(item.status);
            ctx.fill();
            
            startAngle += sliceAngle;
        });
    }, [data, total]);
    
    // Calcola percentuali
    const dataWithPercentage = data.map(item => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-text-primary mb-6 font-['Montserrat'] flex items-center">
                {icon}
                {title}
            </h2>
            <div className="flex">
                <div className="w-1/2">
                    <canvas ref={canvasRef} width={180} height={180} />
                </div>
                <div className="w-1/2 pl-4">
                    {dataWithPercentage.map((item, index) => {
                        return (
                            <div key={index} className="flex items-center mb-3">
                                <div 
                                    className="w-3 h-3 mr-2 rounded-full" 
                                    style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm text-text-secondary font-['Roboto']">
                                    {item.label}: {item.percentage}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StatusDistributionChart;
