import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../../types/game';

interface GameHighlightListProps {
    title: string;
    icon?: ReactNode;
    items: { game: Game; detail: string }[];
    emptyMessage: string;
}

// Elenco breve di giochi con un dato a destra, ognuno porta alla sua pagina
export default function GameHighlightList({ title, icon, items, emptyMessage }: GameHighlightListProps) {
    return (
        <div className="bg-primary-bg p-6 rounded-lg shadow-sm border border-border-color hover:shadow-lg hover:border-accent-primary/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-text-primary mb-4 font-['Montserrat'] flex items-center">
                {icon}
                {title}
            </h2>
            {items.length === 0 ? (
                <p className="text-sm text-text-secondary font-['Roboto'] py-4">{emptyMessage}</p>
            ) : (
                <ul className="divide-y divide-border-color">
                    {items.map(({ game, detail }) => (
                        <li key={game.id}>
                            <Link
                                to={`/library/${encodeURIComponent(game.Title.replace(/\s/g, '_'))}`}
                                className="flex items-center justify-between gap-3 py-2 hover:text-accent-primary transition-colors"
                            >
                                <span className="text-sm font-medium text-text-primary truncate">{game.Title}</span>
                                <span className="text-sm text-text-secondary whitespace-nowrap">{detail}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
