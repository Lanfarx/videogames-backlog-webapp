import React from 'react';
import CommentsSection from '../ui/CommentsSection';
import { ActivityComment, CreateActivityCommentDto } from '../../types/activity';
import { CommunityService } from '../../store/services/communityService';

interface ActivityCommentsSectionProps {
  activityId: number;
  commentsCount: number;
}

const ActivityCommentsSection: React.FC<ActivityCommentsSectionProps> = ({ 
  activityId, 
  commentsCount 
}) => {
  // Funzioni wrapper per adattare i tipi ai requisiti di CommentsSection
  const addComment = async (dto: CreateActivityCommentDto): Promise<ActivityComment> => {
    const result = await CommunityService.addActivityComment(dto);
    if (!result) {
      throw new Error('Errore nell\'aggiunta del commento');
    }
    return result;
  };

  const deleteComment = async (commentId: number): Promise<void> => {
    const success = await CommunityService.deleteActivityComment(commentId);
    if (!success) {
      throw new Error('Errore nell\'eliminazione del commento');
    }
  };

  return (
    <CommentsSection<ActivityComment, CreateActivityCommentDto>
      entityId={activityId}
      entityType="activity"
      commentsCount={commentsCount}
      fetchComments={CommunityService.getActivityComments}
      addComment={addComment}
      deleteComment={deleteComment}
      createCommentDto={(text: string, entityId: number) => ({ text, activityId: entityId })}
      texts={{
        addComment: 'Aggiungi un commento',
        firstComment: 'Sii il primo a commentare questa attività',
        viewComments: 'Clicca per visualizzare i commenti',
        noComments: 'Nessun commento ancora. Sii il primo a commentare!',
        confirmDelete: 'Sei sicuro di voler eliminare questo commento?'
      }}
    />
  );
};

export default ActivityCommentsSection;
