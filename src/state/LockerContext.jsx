import { createContext } from 'react';

// What every screen shares.
const LockerContext = createContext(null);

export function LockerProvider({ children }) {
  const value = {};
  return <LockerContext.Provider value={value}>{children}</LockerContext.Provider>;
}
