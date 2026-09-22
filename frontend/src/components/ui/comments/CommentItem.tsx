import React from 'react';
import { Trash2 } from 'lucide-react';
import { BaseComment } from '../CommentsSection';

interface CommentItemProps {
  comment: BaseComment;
  index: number;
  isOwnComment: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (id: number) => void;
  onNavigateToProfile: (username: string) => void;
}

export function CommentItem({ 
  comment, 
  index, 
  isOwnComment, 
  canDelete, 
  isDeleting, 
  onDelete, 
  onNavigateToProfile 
}: CommentItemProps) {
  return (
    <div 
      className={`flex gap-3 p-4 bg-gradient-to-br from-secondary-bg to-primary-bg rounded-xl border border-border-color hover:border-accent-primary/30 transition-all duration-300 hover:shadow-md ${
        isDeleting ? 'opacity-50' : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div 
        className={`w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg ${
          isOwnComment ? 'ring-2 ring-accent-primary/30' : 'cursor-pointer hover:scale-105'
        } transition-all`}
        onClick={isOwnComment ? undefined : () => onNavigateToProfile(comment.authorUsername)}
        title={isOwnComment ? 'Il tuo commento' : `Vai al profilo di ${comment.authorUsername}`}
      >
        {comment.authorAvatar ? (
          <img 
            src={comment.authorAvatar} 
            alt={`Avatar di ${comment.authorUsername}`}
            className="w-full h-full object-cover rounded-full" 
          />
        ) : (
          comment.authorUsername.charAt(0).toUpperCase()
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span 
              className={`font-semibold text-text-primary text-sm ${
                isOwnComment ? 'text-accent-primary' : 'cursor-pointer hover:text-accent-primary'
              } transition-colors`}
              onClick={isOwnComment ? undefined : () => onNavigateToProfile(comment.authorUsername)}
              title={isOwnComment ? 'Il tuo commento' : `Vai al profilo di ${comment.authorUsername}`}
            >
              {comment.authorUsername}
              {isOwnComment && <span className="text-xs text-accent-primary ml-1">(Tu)</span>}
            </span>
            <span className="text-xs text-text-secondary bg-text-secondary/10 px-2 py-1 rounded-full">
              {new Date(comment.date).toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          {canDelete && (                         
             <button
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
              className="text-text-secondary hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
              title="Elimina commento"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-text-primary leading-relaxed">
          {comment.text}
        </p>
      </div>
    </div>
  );
}
