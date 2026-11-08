import React, { ReactNode } from 'react';
import { MonthValue } from '../../store/services/gamesService';

interface MonthlyChartProps {
    data: MonthValue[];
    kind: 'bar' | 'line';
    title: string;
    icon?: ReactNode;
    unit: string;
    emptyMessage: string;
}

const WIDTH = 480;
const HEIGHT = 180;
const PADDING = { top: 16, right: 12, bottom: 28, left: 12 };

const MONTH_LABELS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const monthLabel = (month: string) => MONTH_LABELS[Number(month.slice(5, 7)) - 1];

// Serie mensile in SVG: barre (ore giocate) o linea (giochi da iniziare)
export default function MonthlyChart({ data, kind, title, icon, unit, emptyMessage }: MonthlyChartProps) {
    const max = Math.max(...data.map(d => d.value), 1);
    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const slot = plotWidth / data.length;
    const x = (i: number) => PADDING.left + slot * i + slot / 2;
    const y = (value: number) => PADDING.top + plotHeight * (1 - value / max);
    const hasData = data.some(d => d.value > 0);

    return (
        <div className="bg-primary-bg p-6 rounded-lg shadow-sm border border-border-color hover:shadow-lg hover:border-accent-primary/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary mb-6 font-['Montserrat'] flex items-center">
                {icon}
                {title}
            </h2>
            {!hasData ? (
                <p className="text-sm text-text-secondary font-['Roboto'] py-10 text-center">{emptyMessage}</p>
            ) : (
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={title}>
                    {kind === 'line' && (
                        <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            className="text-accent-primary"
                            points={data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')}
                        />
                    )}
                    {data.map((d, i) => (
                        <g key={d.month}>
                            <title>{`${monthLabel(d.month)} ${d.month.slice(0, 4)}: ${d.value} ${unit}`}</title>
                            {kind === 'bar' ? (
                                <rect
                                    x={x(i) - slot * 0.3}
                                    y={y(d.value)}
                                    width={slot * 0.6}
                                    height={PADDING.top + plotHeight - y(d.value)}
                                    rx={3}
                                    className="fill-accent-primary"
                                />
                            ) : (
                                <circle cx={x(i)} cy={y(d.value)} r={3.5} className="fill-accent-primary" />
                            )}
                            {d.value > 0 && (
                                <text x={x(i)} y={y(d.value) - 5} textAnchor="middle" className="fill-text-secondary" fontSize={10}>
                                    {d.value}
                                </text>
                            )}
                            <text x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-text-secondary" fontSize={10}>
                                {monthLabel(d.month)}
                            </text>
                        </g>
                    ))}
                </svg>
            )}
        </div>
    );
}
