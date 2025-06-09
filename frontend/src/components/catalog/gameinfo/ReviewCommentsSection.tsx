import React from 'react';
import CommentsSection from '../../ui/CommentsSection';
import { CreateReviewCommentDto, ReviewCommentDto } from '../../../types/community';
import { CommunityService } from '../../../store/services/communityService';

interface ReviewCommentsSectionProps {
  reviewGameId: number;
  commentsCount: number;
}

const ReviewCommentsSection: React.FC<ReviewCommentsSectionProps> = ({ 
  reviewGameId, 
  commentsCount 
}) => {
  // Funzioni wrapper per adattare i tipi ai requisiti di CommentsSection
  const addComment = async (dto: CreateReviewCommentDto): Promise<ReviewCommentDto> => {
    const result = await CommunityService.addReviewComment(dto);
    if (!result) {
      throw new Error('Errore nell\'aggiunta del commento');
    }
    return result;
  };

  const deleteComment = async (commentId: number): Promise<void> => {
    const success = await CommunityService.deleteReviewComment(commentId);
    if (!success) {
      throw new Error('Errore nell\'eliminazione del commento');
    }
  };

  return (
    <CommentsSection<ReviewCommentDto, CreateReviewCommentDto>
      entityId={reviewGameId}
      entityType="review"
      commentsCount={commentsCount}
      fetchComments={CommunityService.getReviewComments}
      addComment={addComment}
      deleteComment={deleteComment}
      createCommentDto={(text: string, entityId: number) => ({
        text,
        reviewGameId: entityId
      })}
      texts={{
        addComment: 'Aggiungi un commento',
        firstComment: 'Sii il primo a commentare questa recensione',
        viewComments: 'Clicca per visualizzare i commenti',
        noComments: 'Nessun commento per questa recensione.'
      }}
    />
  );
};

export default ReviewCommentsSection;
