import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      // Clear any partial state
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    if (!userData || !userData._id) {
      console.error('Invalid user data');
      return;
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthError(null);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const register = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setAuthError(null);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    authError,
    setAuthError,
    login,
    logout,
    register,
    updateUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
