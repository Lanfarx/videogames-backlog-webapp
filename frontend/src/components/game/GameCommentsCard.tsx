import { useState } from 'react';
import { Plus } from 'lucide-react';
import CommentItem from './ui/CommentItem';

interface Comment {
  id: number;
  date: string;
  text: string;
}

interface GameCommentsCardProps {
  comments: Comment[];
  onAddComment?: (text: string) => void;
  onEditComment?: (id: number) => void;
  onDeleteComment?: (id: number) => void;
}

const GameCommentsCard = ({ 
  comments, 
  onAddComment, 
  onEditComment, 
  onDeleteComment 
}: GameCommentsCardProps) => {
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-primary font-semibold text-xl text-text-primary">
          Appunti di gioco <span className="text-sm text-text-secondary">({comments.length})</span>
        </h2>
      </div>

      {/* Input per nuovo commento */}
      <div className="mb-4">
        <div className="flex">
          <textarea
            className="flex-1 p-3 border border-border-color rounded-l-lg focus:border-accent-primary focus:ring-accent-primary/30 outline-none font-secondary text-sm text-text-primary resize-none"
            placeholder="Aggiungi un appunto..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={1}
          ></textarea>
          <button 
            className="px-4 bg-accent-primary text-white rounded-r-lg font-secondary font-medium text-sm hover:bg-accent-primary/90 transition-colors"
            onClick={handleAddComment}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lista commenti */}
      <div>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            id={comment.id}
            date={comment.date}
            text={comment.text}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
          />
        ))}
      </div>
    </div>
  );
};

export default GameCommentsCard;
