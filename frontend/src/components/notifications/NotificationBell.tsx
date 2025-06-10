
import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  fetchNotificationsThunk, 
  fetchUnreadCountThunk 
} from '../../store/thunks/notificationThunks';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell: React.FC = () => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  
  const { unreadCount } = useSelector((state: RootState) => state.notification);

  // Carica il conteggio delle notifiche non lette al mount
  useEffect(() => {
    dispatch(fetchUnreadCountThunk() as any);
  }, [dispatch]);

  // Gestisci il click fuori dal dropdown per chiuderlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      // Carica le notifiche quando viene aperto il dropdown
      dispatch(fetchNotificationsThunk() as any);
    }
  };

  return (
    <div ref={bellRef} className="relative">
      <button
        onClick={handleBellClick}
        className={`relative p-2 rounded-lg transition-colors ${
          isDropdownOpen 
            ? 'text-accent-primary bg-accent-primary/10' 
            : 'text-text-secondary hover:text-accent-primary hover:bg-accent-primary/5'
        }`}
        aria-label="Notifiche"
      >
        <Bell className="h-6 w-6" />
        
        {/* Badge per il conteggio delle notifiche non lette */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-danger text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown delle notifiche */}
      {isDropdownOpen && (
        <NotificationDropdown onClose={() => setIsDropdownOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
