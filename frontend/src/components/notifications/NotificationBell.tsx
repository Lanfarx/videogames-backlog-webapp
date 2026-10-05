import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { 
  fetchNotificationsThunk, 
  fetchUnreadCountThunk 
} from '../../store/thunks/notificationThunks';
import NotificationDropdown from './NotificationDropdown';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

export default function NotificationBell() {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  
  const { unreadCount } = useSelector((state: RootState) => state.notification);

  // Carica il conteggio delle notifiche non lette al mount
  useEffect(() => {
    dispatch(fetchUnreadCountThunk() as any);
  }, [dispatch]);

  // Gestisci il click fuori dal dropdown per chiuderlo
  useOnClickOutside(bellRef, () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  });

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
        className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
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
}
