import React, { ReactNode } from 'react';

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
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
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
                                <span>{item.genre}</span>
                                <span className="font-semibold">{item.count}</span>
                            </div>
                            <div className="w-full bg-tertiaryBg h-3 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full"
                                    style={{ 
                                        width: `${widthPercentage}%`,
                                        backgroundColor: index === 0 ? 'rgb(var(--accent-primary))' : 
                                                        index === 1 ? 'rgba(var(--accent-primary), 0.8)' : 
                                                        index === 2 ? 'rgba(var(--accent-primary), 0.6)' : 
                                                        index === 3 ? 'rgba(var(--accent-primary), 0.4)' : 
                                                        'rgba(var(--accent-primary), 0.2)'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default GenreBarChart;
