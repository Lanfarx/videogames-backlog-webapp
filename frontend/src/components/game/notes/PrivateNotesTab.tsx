import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';

interface PrivateNotesTabProps {
  initialNotes: string;
  isNotStarted: boolean;
  onSave: (notes: string) => void;
}

export function PrivateNotesTab({ initialNotes, isNotStarted, onSave }: PrivateNotesTabProps) {
  const [notesValue, setNotesValue] = useState(initialNotes);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setNotesValue(initialNotes);
  }, [initialNotes]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesValue(e.target.value);
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleSave = () => {
    onSave(notesValue);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div>
      <textarea
        className="w-full p-4 min-h-[180px] border border-border-color rounded-lg bg-secondary-bg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 outline-none font-secondary text-base text-text-primary resize-none transition-colors"
        placeholder="Aggiungi le tue note private per questo gioco..."
        value={notesValue}
        onChange={handleChange}
      ></textarea>
      
      <div className="flex justify-between items-center mt-4">
        {saveSuccess && (
          <span className="text-accent-success text-sm font-secondary">
            Note salvate con successo!
          </span>
        )}
        {isNotStarted && (
          <span className="text-amber-500 text-sm font-secondary flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Per scrivere una recensione, inizia a giocare a questo titolo.
          </span>
        )}
        <div className="ml-auto">
          <button 
            className="px-6 py-2 bg-accent-primary text-white rounded-lg font-secondary font-medium text-sm hover:opacity-90 transition-opacity flex items-center"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Salva note
          </button>
        </div>
      </div>
    </div>
  );
}
