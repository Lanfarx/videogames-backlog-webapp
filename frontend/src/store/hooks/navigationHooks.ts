import { useCallback } from 'react';

export type FriendsSection = 'friends' | 'requests' | 'search';
export type RequestsSubSection = 'received' | 'sent';

// Hook per gestire la navigazione nelle sezioni degli amici
export function useFriendsNavigation() {
  // Funzione per navigare a una sezione specifica
  const navigateToSection = useCallback((section: FriendsSection, subSection?: RequestsSubSection) => {
    // Emette un evento personalizzato che può essere catturato dal componente principale
    const event = new CustomEvent('navigateToFriendsSection', {
      detail: { section, subSection }
    });
    window.dispatchEvent(event);
  }, []);

  // Shortcut per sezioni specifiche
  const navigateToFriends = useCallback(() => {
    navigateToSection('friends');
  }, [navigateToSection]);

  const navigateToReceivedRequests = useCallback(() => {
    navigateToSection('requests', 'received');
  }, [navigateToSection]);

  const navigateToSentRequests = useCallback(() => {
    navigateToSection('requests', 'sent');
  }, [navigateToSection]);

  const navigateToSearch = useCallback(() => {
    navigateToSection('search');
  }, [navigateToSection]);

  return {
    navigateToSection,
    navigateToFriends,
    navigateToReceivedRequests,
    navigateToSentRequests,
    navigateToSearch
  };
}
