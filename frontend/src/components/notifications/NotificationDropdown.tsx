
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Check, X, UserPlus, UserCheck, UserX, Trash2, CheckCheck, Bell } from 'lucide-react';
import { RootState } from '../../store';
import { 
  markNotificationAsReadThunk,
  deleteNotificationThunk,
  markAllNotificationsAsReadThunk,
  deleteAllNotificationsThunk
} from '../../store/thunks/notificationThunks';
import { 
  acceptFriendRequestThunk,
  rejectFriendRequestThunk
} from '../../store/thunks/friendshipThunks';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.notification);
  const handleMarkAsRead = (notificationId: number) => {
    dispatch(markNotificationAsReadThunk(notificationId) as any);
  };

  const handleDeleteNotification = (notificationId: number) => {
    dispatch(deleteNotificationThunk(notificationId) as any);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsReadThunk() as any);
  };

  const handleDeleteAll = () => {
    dispatch(deleteAllNotificationsThunk() as any);
  };

  const handleAcceptFriendRequest = (requestId: number, notificationId: number) => {
    dispatch(acceptFriendRequestThunk(requestId) as any).then(() => {
      // Segna la notifica come letta dopo aver accettato la richiesta
      handleMarkAsRead(notificationId);
    });
  };
  const handleRejectFriendRequest = (requestId: number, notificationId: number) => {
    dispatch(rejectFriendRequestThunk(requestId) as any).then(() => {
      // Elimina la notifica dopo aver rifiutato la richiesta
      handleDeleteNotification(notificationId);
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="h-5 w-5 text-accent-primary" />;
      case 'friend_accepted':
        return <UserCheck className="h-5 w-5 text-accent-success" />;
      case 'friend_rejected':
        return <UserX className="h-5 w-5 text-accent-danger" />;
      default:
        return <UserPlus className="h-5 w-5 text-text-secondary" />;
    }
  };  const formatNotificationTime = (createdAt: string) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ora';
    if (diffInMinutes < 60) return `${diffInMinutes} min fa`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ore fa`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} giorni fa`;
    
    return notificationTime.toLocaleDateString('it-IT');
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-primary-bg border border-border-color rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-color">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">
            Notifiche {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors flex items-center gap-1"
                title="Segna tutte come lette"
              >
                <CheckCheck className="h-3 w-3" />
                Lette
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-xs text-accent-danger hover:text-accent-danger/80 transition-colors flex items-center gap-1"
                title="Elimina tutte"
              >
                <Trash2 className="h-3 w-3" />
                Elimina
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-text-secondary">
            Caricamento notifiche...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-text-secondary">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nessuna notifica</p>
          </div>
        ) : (
          <div className="divide-y divide-border-color">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-secondary-bg transition-colors ${
                  !notification.isRead ? 'bg-accent-primary/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icona */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenuto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-text-secondary text-xs mt-1">
                          {notification.message}
                        </p>                        <p className="text-text-secondary text-xs mt-1">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>

                      {/* Indicatore non letto */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-accent-primary rounded-full flex-shrink-0 mt-1 ml-2" />
                      )}
                    </div>

                    {/* Azioni per richieste di amicizia */}
                    {notification.type === 'friend_request' && notification.data?.requestId && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleAcceptFriendRequest(
                            notification.data!.requestId!, 
                            notification.id
                          )}
                          className="px-3 py-1 bg-accent-success text-white text-xs rounded-md hover:bg-accent-success/90 transition-colors flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Accetta
                        </button>
                        <button
                          onClick={() => handleRejectFriendRequest(
                            notification.data!.requestId!, 
                            notification.id
                          )}
                          className="px-3 py-1 bg-accent-danger text-white text-xs rounded-md hover:bg-accent-danger/90 transition-colors flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Rifiuta
                        </button>
                      </div>
                    )}

                    {/* Azioni generali */}
                    <div className="flex items-center justify-end gap-2 mt-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
                        >
                          Segna come letta
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-xs text-accent-danger hover:text-accent-danger/80 transition-colors"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
