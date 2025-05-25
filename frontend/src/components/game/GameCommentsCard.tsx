import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import CommentItem from './ui/CommentItem';
import { GameComment } from '../../types/game';
import FormErrorInline from '../ui/atoms/FormErrorInline';

interface GameCommentsCardProps {
  comments: GameComment[];
  onAddComment?: (text: string) => void;
  onEditComment?: (id: number, text: string) => void;
  onDeleteComment?: (id: number) => void;
  maxComments?: number; // Numero massimo di commenti consentiti
}

const GameCommentsCard = ({ 
  comments = [], 
  onAddComment, 
  onEditComment, 
  onDeleteComment,
  maxComments = 8 // Valore predefinito: massimo 10 commenti
}: GameCommentsCardProps) => {
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  // Verifica se è stato raggiunto il limite massimo di commenti
  const isCommentLimitReached = comments.length >= maxComments;
  
  const handleAddComment = () => {
    if (commentText.trim() && onAddComment && !isCommentLimitReached) {
      onAddComment(commentText);
      setCommentText('');
    }
  };
  
  const startEditComment = (id: number, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };
  
  const cancelEditComment = () => {
    setEditingId(null);
    setEditingText('');
  };
  
  const saveEditComment = () => {
    if (editingId !== null && editingText.trim() && onEditComment) {
      onEditComment(editingId, editingText);
      setEditingId(null);
      setEditingText('');
    }
  };
  return (
    <div className="bg-primaryBg border border-border-color rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-primary font-semibold text-xl text-text-primary">
          Appunti di gioco <span className="text-sm text-text-secondary">({comments.length})</span>
        </h2>
      </div>      {/* Input per nuovo commento */}
      <div className="mb-4">
        {isCommentLimitReached && (
          <FormErrorInline message={`Hai raggiunto il limite massimo di ${maxComments} appunti.`} />
        )}
        <div className="flex">
          <textarea
            className="flex-1 p-3 border border-border-color rounded-l-lg focus:border-accent-primary focus:ring-accent-primary/30 outline-none font-secondary text-sm text-text-primary resize-none"
            placeholder={isCommentLimitReached ? "Hai raggiunto il limite massimo di appunti" : "Aggiungi un appunto..."}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={1}
            disabled={isCommentLimitReached}
          ></textarea>
          <button
            className={`px-4 ${!commentText.trim() || isCommentLimitReached ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent-primary hover:bg-accent-primary/90'} text-white rounded-r-lg font-secondary font-medium text-sm transition-colors`}
            onClick={handleAddComment}
            disabled={!commentText.trim() || isCommentLimitReached}          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {commentText.trim() && isCommentLimitReached && (
          <FormErrorInline 
            message="Non è possibile aggiungere altri appunti, è stato raggiunto il limite massimo." 
            className="mt-2" 
          />
        )}
      </div>

      {/* Lista commenti con scrollbar */}
      <div className="max-h-80 overflow-y-auto pr-1 custom-scrollbar" 
           style={{ 
             scrollbarWidth: 'thin',
             scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
           }}>
        {comments.length === 0 ? (
          <p className="text-center text-text-secondary font-secondary text-sm py-4">
            Non ci sono ancora appunti per questo gioco.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              {editingId === comment.id ? (
                // Modalità modifica
                <div className="py-3 border-b border-border-color">
                  <textarea
                    className="w-full p-3 mb-2 border border-border-color rounded-lg focus:border-accent-primary focus:ring-accent-primary/30 outline-none font-secondary text-sm text-text-primary resize-none"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={2}
                  ></textarea>
                  <div className="flex justify-end space-x-2">
                    <button 
                      className="text-sm text-text-secondary hover:text-text-primary font-secondary"
                      onClick={cancelEditComment}
                    >
                      Annulla
                    </button>
                    <button 
                      className="flex items-center px-3 py-1 bg-accent-primary text-white rounded-md text-sm hover:bg-accent-primary/90 transition-colors font-secondary"
                      onClick={saveEditComment}
                      disabled={!editingText.trim()}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Salva
                    </button>
                  </div>
                </div>
              ) : (
                // Visualizzazione normale
                <CommentItem
                  id={comment.id}
                  date={new Date(comment.date).toLocaleDateString('it-IT')}
                  text={comment.text}
                  onEdit={() => startEditComment(comment.id, comment.text)}
                  onDelete={() => onDeleteComment && onDeleteComment(comment.id)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameCommentsCard;
