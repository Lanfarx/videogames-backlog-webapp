import React, { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { ActivityReaction, ActivityReactionSummary } from '../../types/activity';
import { useAppSelector } from '../../store/hooks';
import { useAppDispatch } from '../../store/hooks';
import { toggleActivityReaction } from '../../store/thunks/activityReactionThunks';
import { CreateActivityReactionDto } from '../../types/activity';

interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
  users: string[]; // Lista degli username che hanno reagito
}

interface ReactionBarProps {
  activityId: number;
  reactions: ActivityReaction[];
  reactionSummary: ActivityReactionSummary[];
  isOwner: boolean; // Se l'utente è proprietario della entry
  className?: string;
}

const AVAILABLE_REACTIONS = [
  { emoji: '👍', label: 'Mi piace' },
  { emoji: '❤️', label: 'Adoro' },
  { emoji: '🔥', label: 'Incredibile' },
  { emoji: '🎮', label: 'Bel gioco' },
  { emoji: '🏆', label: 'Complimenti' },
  { emoji: '😂', label: 'Divertente' },
  { emoji: '🤔', label: 'Interessante' },
  { emoji: '💯', label: 'Perfetto' }
];

const ReactionBar: React.FC<ReactionBarProps> = ({
  activityId,
  reactions,
  reactionSummary,
  isOwner,
  className = ''
}) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.user.profile);
  const currentUserId = Number(currentUser?.userId) || 0;
  const loading = useAppSelector(state => state.activityReactions.loading);

  // Converte i dati backend nel formato richiesto dal componente
  const processedReactions = useMemo((): Record<string, Reaction> => {
    const reactionMap: Record<string, Reaction> = {};
    
    reactionSummary.forEach(summary => {
      const hasReacted = reactions.some(reaction => 
        reaction.userId === currentUserId && reaction.emoji === summary.emoji
      );
      
      reactionMap[summary.emoji] = {
        emoji: summary.emoji,
        count: summary.count,
        hasReacted,
        users: summary.userNames
      };
    });
    
    return reactionMap;
  }, [reactionSummary, reactions, currentUserId]);

  // Ottieni solo le emoji che hanno almeno una reazione
  const activeReactions = useMemo(() => {
    return Object.values(processedReactions).filter(reaction => reaction.count > 0);
  }, [processedReactions]);

  // Ottieni le emoji disponibili che non sono ancora state utilizzate
  const availableNewReactions = useMemo(() => {
    const usedEmojis = new Set(activeReactions.map(r => r.emoji));
    return AVAILABLE_REACTIONS.filter(({ emoji }) => !usedEmojis.has(emoji));
  }, [activeReactions]);

  const handleReactionClick = useCallback(async (emoji: string) => {
    if (loading) return;

    const createReactionDto: CreateActivityReactionDto = {
      activityId,
      emoji
    };

    try {
      await dispatch(toggleActivityReaction(createReactionDto));
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Errore nel toggle della reazione:', error);
    }
  }, [dispatch, activityId, loading]);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Mostra le emoji attive con i loro conteggi */}
      {activeReactions.map((reaction) => {
        const emojiData = AVAILABLE_REACTIONS.find(r => r.emoji === reaction.emoji);
        const tooltipText = reaction.users.length > 0 
          ? `${emojiData?.label || ''}: ${reaction.users.join(', ')}`
          : emojiData?.label || '';
          
        return (
          <button
            key={reaction.emoji}
            onClick={() => handleReactionClick(reaction.emoji)}
            disabled={loading}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
              reaction.hasReacted 
                ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={tooltipText}
          >
            <span className="text-sm">{reaction.emoji}</span>
            <span className="text-xs font-medium">{reaction.count}</span>
          </button>
        );
      })}

      {/* Pulsante per aggiungere nuove reazioni (solo se ci sono ancora emoji disponibili) */}
      {availableNewReactions.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            disabled={loading}
            className={`flex items-center justify-center w-7 h-7 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Aggiungi reazione"
          >
            <Plus className="w-3 h-3" />
          </button>          {/* Picker delle reazioni disponibili */}
          {showReactionPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
              <div className="grid grid-cols-2 gap-2 min-w-[160px]">
                {availableNewReactions.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(emoji)}
                    disabled={loading}
                    className={`p-3 rounded hover:bg-gray-100 transition-colors text-xl ${
                      loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    title={label}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Overlay per chiudere il picker quando si clicca fuori */}
          {showReactionPicker && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowReactionPicker(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ReactionBar;