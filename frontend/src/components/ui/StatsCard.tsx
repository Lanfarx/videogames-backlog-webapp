import React, { ReactNode } from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    icon?: ReactNode;
    variant?: 'default' | 'hero';
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, variant = 'default' }) => {
    // Formatta il valore con separatori per le migliaia solo se è un numero puro
    const formattedValue = value.includes('%') ? value : parseInt(value).toLocaleString('it-IT');    if (variant === 'hero') {
        return (
            <div className="flex flex-col items-center">
                {icon && (
                    <div className="mb-3 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                        {icon}
                    </div>
                )}
                <div className="text-4xl lg:text-5xl font-bold text-accent-primary font-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                    {formattedValue}
                </div>
                <div className="text-sm text-text-secondary font-secondary">
                    {label}
                </div>
            </div>
        );
    }return (
        <div className="bg-primary-bg p-6 rounded-lg shadow-sm border border-border-color hover:shadow-md hover:border-accent-primary/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
                <div className="text-base text-text-secondary font-secondary">{label}</div>
                {icon && (
                    <div className="text-accent-primary/60">
                        {icon}
                    </div>
                )}
            </div>
            <div className="text-4xl font-bold text-accent-primary font-primary">{formattedValue}</div>
        </div>
    );
};

export default StatsCard;
