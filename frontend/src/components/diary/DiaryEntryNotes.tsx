import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DiaryEntryNotesProps {
  notes: string;
}

export function DiaryEntryNotes({ notes }: DiaryEntryNotesProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-secondary-bg p-3 rounded-lg mt-2">
      <div className="flex items-center mb-2">
        <span className="text-sm font-medium text-text-primary">Note</span>
      </div>
      <p className={`text-xs text-text-secondary ${!expanded ? 'line-clamp-2' : ''}`}>
        {notes}
      </p>
      {notes.length > 100 && (
        <button 
          className="flex items-center text-xs text-accent-primary mt-1 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Mostra meno
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Mostra tutto
            </>
          )}
        </button>
      )}
    </div>
  );
}
