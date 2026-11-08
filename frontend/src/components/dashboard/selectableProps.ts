import React from 'react';

// Rende cliccabile (e raggiungibile da tastiera) una riga di grafico
export function selectableProps(onSelect?: () => void): React.HTMLAttributes<HTMLElement> {
    if (!onSelect) return {};
    return {
        role: 'button',
        tabIndex: 0,
        onClick: onSelect,
        onKeyDown: event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect();
            }
        }
    };
}
