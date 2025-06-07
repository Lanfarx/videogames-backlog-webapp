import React, { ReactNode } from 'react';

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
    return (
        <div className="bg-primary-bg p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-text-primary mb-6 font-['Montserrat'] flex items-center">
                {icon}
                {title}
            </h2>
            <div className="space-y-6">
                {data.map((item, index) => {
                    const widthPercentage = (item.count / Math.max(...data.map(i => i.count))) * 100;
                    
                    return (
                        <div key={index} className="w-full">
                            <div className="flex justify-between text-sm text-text-primary mb-1 font-['Roboto']">
                                <span>{item.Platform}</span>
                                <span className="font-semibold">{item.count}</span>
                            </div>
                            <div className="w-full bg-tertiary-bg h-3 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${index === 0 ? 'bg-accent-primary' : ''}`}
                                    style={{ 
                                        width: `${widthPercentage}%`,
                                        backgroundColor: index === 0 ? 'rgb(var(--accent-primary))' : 
                                                        index === 1 ? 'rgba(var(--accent-primary), 0.8)' : 
                                                        index === 2 ? 'rgba(var(--accent-primary), 0.6)' : 
                                                        'rgba(var(--accent-primary), 0.4)'
                                    }}
                                />
                            </div>
                        </div>
                    )})}
            </div>
        </div>
    );
};

export default PlatformBarChart;
