
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize state with initialValue. This ensures server and client match on first render.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // useEffect to load the value from localStorage on the client side after initial render.
  useEffect(() => {
    // Check if window is defined (i.e., we are on the client side).
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      // If item exists in localStorage, parse it and update state.
      // Otherwise, storedValue remains initialValue.
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      // In case of error, storedValue remains initialValue.
    }
  }, [key]); // Dependency array ensures this effect runs if the key changes.

  // Wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      console.warn(
        `Tried setting localStorage key “${key}” even though environment is not a client`
      );
      return; // Don't try to set localStorage on the server
    }
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
