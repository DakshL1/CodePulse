import React, { createContext, useContext, useEffect, useState } from 'react';

const RoleContext = createContext();

export const useRole = () => useContext(RoleContext);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    return localStorage.getItem("userRole") || null; // Retrieve from localStorage
  });

  useEffect(() => {
    if (role) {
      localStorage.setItem("userRole", role); // Store in localStorage
    }
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
};
