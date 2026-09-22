import { useState, useEffect } from 'react';

export function useSidebarFilterState() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('librarySidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [showAllGenres, setShowAllGenres] = useState(() => {
    const saved = localStorage.getItem('libraryShowAllGenres');
    return saved ? JSON.parse(saved) : false;
  });

  const [expandedSections, setExpandedSections] = useState(() => {
    try {
      const savedExpandedSections = localStorage.getItem('libraryExpandedSections');
      if (savedExpandedSections) {
        return JSON.parse(savedExpandedSections);
      }
    } catch (error) {
      console.warn('Errore nel caricamento degli stati espansi:', error);
    }
    return {
      Status: true,
      Platform: true,
      genre: true,
      Price: true,
      hours: true,
      Metacritic: true,
      date: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('librarySidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('libraryShowAllGenres', JSON.stringify(showAllGenres));
  }, [showAllGenres]);

  useEffect(() => {
    try {
      localStorage.setItem('libraryExpandedSections', JSON.stringify(expandedSections));
    } catch (error) {
      console.warn('Errore salvataggio stati espansi:', error);
    }
  }, [expandedSections]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return {
    isCollapsed,
    setIsCollapsed,
    showAllGenres,
    setShowAllGenres,
    expandedSections,
    toggleSection
  };
}
