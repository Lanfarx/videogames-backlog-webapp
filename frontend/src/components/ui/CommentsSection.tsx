import React, { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { CommentInput } from './comments/CommentInput';
import { CommentItem } from './comments/CommentItem';

export interface BaseComment {
  id: number;
  text: string;
  date: string;
  authorId: number;
  authorUsername: string;
  authorAvatar?: string;
}

export interface CreateCommentDto {
  text: string;
}

interface CommentsSectionProps<T extends BaseComment, C extends CreateCommentDto> {
  entityId: number;
  entityType: 'activity' | 'review';
  commentsCount: number;
  
  fetchComments: (entityId: number) => Promise<T[]>;
  addComment: (dto: C) => Promise<T>;
  deleteComment: (commentId: number) => Promise<void>;
  
  createCommentDto: (text: string, entityId: number) => C;
  
  texts?: {
    addComment?: string;
    firstComment?: string;
    viewComments?: string;
    noComments?: string;
    confirmDelete?: string;
  };
  isEntityOwner?: boolean;
}

const defaultTexts = {
  addComment: 'Aggiungi un commento',
  firstComment: 'Sii il primo a commentare',
  viewComments: 'Clicca per visualizzare i commenti',
  noComments: 'Nessun commento ancora. Sii il primo a commentare!',
  confirmDelete: 'Sei sicuro di voler eliminare questo commento?'
};

function CommentsSection<T extends BaseComment, C extends CreateCommentDto>({
  entityId,
  entityType,
  commentsCount,
  fetchComments,
  addComment,
  deleteComment,
  createCommentDto,
  texts = {},
  isEntityOwner = false
}: CommentsSectionProps<T, C>) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [actualCount, setActualCount] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.profile);
  
  const finalTexts = { ...defaultTexts, ...texts };
  
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments]);

  useEffect(() => {
    if (actualCount === null && commentsCount === 0) {
      checkActualCommentsCount();
    }
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await fetchComments(entityId);
      setComments(fetchedComments);
      setActualCount(fetchedComments.length);
    } catch (error) {
      console.error(`Errore nel caricamento dei commenti ${entityType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const checkActualCommentsCount = async () => {
    try {
      const fetchedComments = await fetchComments(entityId);
      setActualCount(fetchedComments.length);
    } catch (error) {
      console.error(`Errore nel controllo del numero di commenti ${entityType}:`, error);
      setActualCount(commentsCount);
    }
  };
  
  const displayCommentsCount = actualCount !== null ? actualCount : commentsCount;

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || submitting) return;

    setSubmitting(true);
    const dto = createCommentDto(newComment.trim(), entityId);
    
    try {
      const newCommentObj = await addComment(dto);
      setComments(prev => [...prev, newCommentObj]);
      setActualCount(prev => (prev !== null ? prev + 1 : 1));
      setNewComment('');
    } catch (error) {
      console.error(`Errore nell'aggiunta del commento ${entityType}:`, error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm(finalTexts.confirmDelete) || deleting) return;
    
    setDeleting(commentId);
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setActualCount(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error(`Errore nell'eliminazione del commento ${entityType}:`, error);
    } finally {
      setDeleting(null);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={toggleComments}
        className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 hover:from-accent-primary/10 hover:to-accent-secondary/10 rounded-xl border border-accent-primary/20 hover:border-accent-primary/40 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-primary text-text-primary rounded-lg group-hover:bg-accent-secondary transition-colors">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-text-primary">
              {displayCommentsCount > 0 ? `${displayCommentsCount} commenti` : finalTexts.addComment}
            </div>
            <div className="text-xs text-text-secondary">
              {displayCommentsCount > 0 
                ? (showComments ? 'Clicca per nascondere i commenti' : 'Clicca per visualizzare i commenti')
                : finalTexts.firstComment
              }
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showComments ? (
            <ChevronUp className="h-4 w-4 text-text-secondary group-hover:text-accent-primary transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-text-secondary group-hover:text-accent-primary transition-colors" />
          )}
        </div>
      </button>

      {showComments && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {user && (
            <CommentInput 
              user={user}
              newComment={newComment}
              setNewComment={setNewComment}
              onSubmit={handleAddComment}
              submitting={submitting}
            />
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-text-secondary">Caricamento commenti...</span>
              </div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment, index) => {
                const isOwnComment = user && user.userName === comment.authorUsername;
                const canDelete = isOwnComment || isEntityOwner;
                
                return (
                  <CommentItem 
                    key={comment.id}
                    comment={comment}
                    index={index}
                    isOwnComment={!!isOwnComment}
                    canDelete={!!canDelete}
                    isDeleting={deleting === comment.id}
                    onDelete={handleDeleteComment}
                    onNavigateToProfile={(username) => navigate(`/profile/${username}`)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center text-text-secondary py-4">
              <div className="text-sm">
                {user ? finalTexts.noComments : `Nessun commento per questa ${entityType === 'activity' ? 'attività' : 'recensione'}.`}
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center text-text-secondary py-2">
              <span className="text-sm">
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-accent-primary hover:underline"
                >
                  Accedi
                </button>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
