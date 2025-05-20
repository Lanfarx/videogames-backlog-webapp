import React, { ReactNode } from 'react';

interface StatsCardProps {
    label: string;
    value: string;
    icon?: ReactNode;
    variant?: 'default' | 'hero';
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, variant = 'default' }) => {
    // Formatta il valore con separatori per le migliaia
    const formattedValue = parseInt(value).toLocaleString('it-IT');
    
    if (variant === 'hero') {
        return (
            <div className="flex flex-col items-center">
                {icon && <div className="mb-2">{icon}</div>}
                <div className="text-5xl font-bold text-accent-primary font-primary">
                    {formattedValue}
                </div>
                <div className="text-sm text-text-secondary mt-1 font-secondary">
                    {label}
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-primary-bg p-6 rounded-lg shadow-sm">
            <div className="text-base text-text-secondary font-secondary">{label}</div>
            <div className="text-4xl font-bold text-text-primary mt-2 font-primary">{formattedValue}</div>
        </div>
    );
};

export default StatsCard;
