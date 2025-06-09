import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// Interfacce generiche per i commenti
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

// Props del componente unificato
interface CommentsSectionProps<T extends BaseComment, C extends CreateCommentDto> {
  // Identificativo dell'entità (attività o recensione)
  entityId: number;
  entityType: 'activity' | 'review';
  commentsCount: number;
  
  // Funzioni API dirette
  fetchComments: (entityId: number) => Promise<T[]>;
  addComment: (dto: C) => Promise<T>;
  deleteComment: (commentId: number) => Promise<void>;
  
  // Funzione per creare il DTO di creazione commento
  createCommentDto: (text: string, entityId: number) => C;
  
  // Testi personalizzabili
  texts?: {
    addComment?: string;
    firstComment?: string;
    viewComments?: string;
    noComments?: string;
    confirmDelete?: string;
  };
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
  texts = {}
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
  
  // Carica i commenti quando la sezione viene aperta
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments]);

  // Verifica il numero reale di commenti al primo rendering per evitare l'UX problem
  useEffect(() => {
    if (actualCount === null && commentsCount === 0) {
      // Solo se il commentsCount è 0, verifica se ci sono davvero commenti
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
      setActualCount(commentsCount); // Fallback al valore passato come prop
    }
  };
  
  // Usa il conteggio reale se disponibile, altrimenti usa il prop
  const displayCommentsCount = actualCount !== null ? actualCount : commentsCount;  const handleAddComment = async () => {
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
      {/* Toggle Comments Button con design migliorato */}      <button
        onClick={toggleComments}
        className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 hover:from-accent-primary/10 hover:to-accent-secondary/10 rounded-xl border border-accent-primary/20 hover:border-accent-primary/40 transition-all duration-300 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-primary text-white rounded-lg group-hover:bg-accent-secondary transition-colors">
            <MessageCircle className="h-4 w-4" />
          </div>          <div className="text-left">            <div className="text-sm font-semibold text-text-primary">
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

      {/* Comments Section con animazione */}
      {showComments && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          {/* Add Comment Form con design migliorato */}
          {user && (
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
                        handleAddComment();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">
                      Premi Shift+Enter per andare a capo
                    </span>                    <button
                      onClick={handleAddComment}
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
          )}          {/* Comments List con design migliorato */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-text-secondary">Caricamento commenti...</span>
              </div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">              {comments.map((comment, index) => {
                const isOwnComment = user && user.userName === comment.authorUsername;
                const isDeletingThis = deleting === comment.id;
                
                return (                  <div 
                    key={comment.id} 
                    className={`flex gap-3 p-4 bg-gradient-to-br from-secondary-bg to-primary-bg rounded-xl border border-border-color hover:border-accent-primary/30 transition-all duration-300 hover:shadow-md ${
                      isDeletingThis ? 'opacity-50' : ''
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div 
                      className={`w-10 h-10 bg-gradient-to-br from-accent-primary to-accent-secondary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg ${
                        isOwnComment ? 'ring-2 ring-accent-primary/30' : 'cursor-pointer hover:scale-105'
                      } transition-all`}
                      onClick={isOwnComment ? undefined : () => navigate(`/profile/${comment.authorUsername}`)}
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
                            onClick={isOwnComment ? undefined : () => navigate(`/profile/${comment.authorUsername}`)}
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
                        {isOwnComment && (                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeletingThis}
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
