import { useState } from 'react';
import RatingStars from '../ui/atoms/RatingStars';

interface NotesReviewCardProps {
  notes: string;
  onNotesChange?: (notes: string) => void;
  onReviewSave?: () => void;
}

const NotesReviewCard = ({ notes, onNotesChange, onReviewSave }: NotesReviewCardProps) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'review'>('notes');
  const [notesValue, setNotesValue] = useState(notes);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesValue(e.target.value);
    if (onNotesChange) {
      onNotesChange(e.target.value);
    }
  };

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6 mb-8">
      <div className="border-b border-border-color mb-4">
        <div className="flex mb-4">
          <button
            className={`pb-2 mr-6 font-primary font-semibold ${
              activeTab === 'notes' ? 'border-b-2 border-accent-primary text-text-primary' : 'text-text-secondary'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            Note
          </button>
          <button
            className={`pb-2 font-primary font-semibold ${
              activeTab === 'review' ? 'border-b-2 border-accent-primary text-text-primary' : 'text-text-secondary'
            }`}
            onClick={() => setActiveTab('review')}
          >
            Recensione
          </button>
        </div>
      </div>

      {activeTab === 'notes' ? (
        <div>
          <textarea
            className="w-full p-4 h-40 border border-border-color rounded-lg focus:border-accent-primary focus:ring-accent-primary/30 outline-none font-secondary text-sm text-text-primary resize-none"
            placeholder="Aggiungi le tue note private per questo gioco..."
            value={notesValue}
            onChange={handleNotesChange}
          ></textarea>
        </div>
      ) : (
        <div>
          <div className="p-4 border border-border-color rounded-lg mb-4">
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 font-secondary font-medium text-sm text-text-secondary">
                    Gameplay
                  </label>
                  <div className="flex">
                    <RatingStars rating={4} />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-secondary font-medium text-sm text-text-secondary">
                    Grafica
                  </label>
                  <div className="flex">
                    <RatingStars rating={5} />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-secondary font-medium text-sm text-text-secondary">
                    Storia
                  </label>
                  <div className="flex">
                    <RatingStars rating={4.5} />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-secondary font-medium text-sm text-text-secondary">
                    Audio
                  </label>
                  <div className="flex">
                    <RatingStars rating={5} />
                  </div>
                </div>
              </div>
            </div>
            <p className="font-secondary text-sm text-text-primary mb-4">
              La mia recensione completa del gioco andrebbe qui. Breath of the Wild è un capolavoro che ridefinisce il genere open world.
            </p>
            <p className="font-secondary italic text-xs text-text-disabled">
              Recensione aggiornata il 25 Gennaio 2023
            </p>
          </div>
          <button 
            className="px-4 py-2 bg-accent-primary text-white rounded-lg font-secondary font-medium text-sm hover:bg-accent-primary/90 transition-colors"
            onClick={onReviewSave}
          >
            Salva modifiche
          </button>
        </div>
      )}
    </div>
  );
};

export default NotesReviewCard;
