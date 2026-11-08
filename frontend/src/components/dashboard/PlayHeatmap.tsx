import React, { ReactNode, useMemo } from 'react';
import { DayValue } from '../../store/services/gamesService';

interface PlayHeatmapProps {
    data: DayValue[];
    title: string;
    icon?: ReactNode;
}

const DAY_MS = 86_400_000;
const WEEKS = 53;
const CELL = 11;
const GAP = 3;
const LEVELS = [0.25, 0.5, 0.75, 1];

// Griglia degli ultimi 12 mesi (stile GitHub): una colonna per settimana, da lunedì a domenica, in date UTC come quelle del server
export default function PlayHeatmap({ data, title, icon }: PlayHeatmapProps) {
    const { weeks, max, total } = useMemo(() => {
        const hours = new Map(data.map(d => [d.date, d.value]));
        const today = Math.floor(Date.now() / DAY_MS) * DAY_MS;
        const mondayOffset = (new Date(today).getUTCDay() + 6) % 7;
        const start = today - mondayOffset * DAY_MS - (WEEKS - 1) * 7 * DAY_MS;
        const columns = Array.from({ length: WEEKS }, (_, w) =>
            Array.from({ length: 7 }, (_, d) => {
                const time = start + (w * 7 + d) * DAY_MS;
                const date = new Date(time).toISOString().slice(0, 10);
                return { date, time, value: time > today ? null : hours.get(date) ?? 0 };
            }));
        return { weeks: columns, max: Math.max(...data.map(d => d.value), 1), total: data.length };
    }, [data]);

    return (
        <div className="bg-primary-bg p-6 rounded-lg shadow-sm border border-border-color hover:shadow-lg hover:border-accent-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary font-['Montserrat'] flex items-center">
                    {icon}
                    {title}
                </h2>
                <span className="text-sm text-text-secondary">{total} giorni giocati</span>
            </div>
            <div className="overflow-x-auto">
                <div className="flex w-max" style={{ gap: GAP }} role="img" aria-label={`${title}: ${total} giorni giocati negli ultimi 12 mesi`}>
                    {weeks.map((week, w) => (
                        <div key={w} className="flex flex-col" style={{ gap: GAP }}>
                            {week.map(day => day.value === null ? (
                                <div key={day.date} style={{ width: CELL, height: CELL }} />
                            ) : (
                                <div
                                    key={day.date}
                                    title={`${new Date(day.time).toLocaleDateString('it-IT', { timeZone: 'UTC' })}: ${day.value} ${day.value === 1 ? 'ora' : 'ore'}`}
                                    className={`rounded-sm ${day.value ? 'bg-accent-primary' : 'bg-tertiary-bg'}`}
                                    style={{ width: CELL, height: CELL, opacity: day.value ? LEVELS[Math.min(3, Math.ceil((day.value / max) * 4) - 1)] : 1 }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            {total === 0 && (
                <p className="text-sm text-text-secondary mt-4">I giorni giocati compariranno dopo la prossima sincronizzazione o aggiornamento delle ore.</p>
            )}
        </div>
    );
}
