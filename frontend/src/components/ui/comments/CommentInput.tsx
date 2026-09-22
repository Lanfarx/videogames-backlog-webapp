import React from 'react';
import { Send } from 'lucide-react';
import { UserProfile } from '../../../types/profile';

interface CommentInputProps {
  user: UserProfile | null;
  newComment: string;
  setNewComment: (val: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export function CommentInput({ user, newComment, setNewComment, onSubmit, submitting }: CommentInputProps) {
  if (!user) return null;

  return (
    <div className="bg-gradient-to-br from-primary-bg to-secondary-bg p-4 rounded-xl border border-border-color">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-full" 
            />
          ) : (
            user.userName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Scrivi un commento..."
            className="w-full px-4 py-3 text-sm bg-secondary-bg border border-border-color rounded-xl focus:outline-none focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 transition-all resize-none"
            rows={3}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">
              Premi Shift+Enter per andare a capo
            </span>
            <button
              onClick={onSubmit}
              disabled={!newComment.trim() || submitting}
              className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-lg hover:from-accent-secondary hover:to-accent-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Invio...' : 'Invia'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
