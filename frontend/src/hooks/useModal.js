// e:\RPG-LAN\frontend\src\hooks\useModal.js
import { useState, useCallback } from 'react';

export function useModal(animationDuration = 300) {
  const [isOpen, setIsOpen] = useState(false); // Controls the visual animation (opacity/transform)
  const [shouldRender, setShouldRender] = useState(false); // Controls presence in DOM
  const [key, setKey] = useState(0); // Unique key to force fresh mount

  const open = useCallback(() => {
    setKey(Date.now()); // Option A/C: Timestamp/Increment for unique key
    setShouldRender(true);
    // Small delay to ensure DOM is mounted before starting animation
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Wait for animation to finish before unmounting
    setTimeout(() => {
      setShouldRender(false);
    }, animationDuration);
  }, [animationDuration]);

  return { 
    isOpen, 
    shouldRender, 
    key, 
    open, 
    close,
    // Helper to toggle based on current state
    toggle: () => (isOpen ? close() : open()) 
  };
}
