
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../index';
import { 
  fetchNotificationsThunk,
  fetchUnreadCountThunk,
  markNotificationAsReadThunk,
  deleteNotificationThunk,
  markAllNotificationsAsReadThunk,
  deleteAllNotificationsThunk
} from '../thunks/notificationThunks';

export const useNotifications = () => {
  const dispatch = useDispatch();
  const notificationState = useSelector((state: RootState) => state.notification);

  return {
    ...notificationState,
    fetchNotifications: () => dispatch(fetchNotificationsThunk() as any),
    fetchUnreadCount: () => dispatch(fetchUnreadCountThunk() as any),
    markAsRead: (id: number) => dispatch(markNotificationAsReadThunk(id) as any),
    deleteNotification: (id: number) => dispatch(deleteNotificationThunk(id) as any),
    markAllAsRead: () => dispatch(markAllNotificationsAsReadThunk() as any),
    deleteAll: () => dispatch(deleteAllNotificationsThunk() as any),
  };
};
