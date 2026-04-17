// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange } from '../firebase/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);      // Firebase Auth user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
