import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const NavBar = () => {
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();

  const handleLogout = () => {
    logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
  };

  return (
    <nav className="bg-gray-900 text-white fixed top-0 w-full shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-xl font-bold">
            <Link to="/">CodePulse</Link>
          </div>

          {/* Navigation Links */}
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:text-gray-400">Home</Link>
            </li>
            <li>
              <Link to="/Interview-mode" className="hover:text-gray-400">Interview Mode</Link>
            </li>
            <li>
              <Link to="/Game-mode" className="hover:text-gray-400">Game Mode</Link>
            </li>
            <li>
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout} 
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md">
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => loginWithRedirect()} 
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md">
                  Log In
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
