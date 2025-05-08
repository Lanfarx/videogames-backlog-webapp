import { Pencil, Trash2 } from 'lucide-react';

interface CommentItemProps {
  id: number;
  date: string;
  text: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const CommentItem = ({ id, date, text, onEdit, onDelete }: CommentItemProps) => {
  return (
    <div className="py-3 border-b border-border-color">
      <div className="flex justify-between mb-1">
        <span className="font-secondary text-xs text-text-disabled">{date}</span>
        <div className="flex space-x-2">
          {onEdit && (
            <Pencil 
              className="w-4 h-4 text-text-secondary hover:text-accent-primary cursor-pointer" 
              onClick={() => onEdit(id)}
            />
          )}
          {onDelete && (
            <Trash2 
              className="w-4 h-4 text-accent-danger cursor-pointer" 
              onClick={() => onDelete(id)}
            />
          )}
        </div>
      </div>
      <p className="font-secondary text-sm text-text-primary">{text}</p>
    </div>
  );
};

export default CommentItem;
