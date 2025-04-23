import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { motion } from "framer-motion";


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
    <nav className="bg-linear-to-bl from-zinc-800 to-black text-white fixed top-0 w-full shadow-md z-50 font-sans-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-xl font-bold">
            <Link to="/">CodePulse</Link>
          </div>

          {/* Navigation Links */}
          <ul className="flex gap-7 justify-between items-center">
            <>
              <li>
                <Link to="/Home" className="hover:text-gray-400">Home</Link>
              </li>
              <li>
                <Link to="/Interview-mode" className="hover:text-gray-400">Interview Mode</Link>
              </li>
              <li>
                <Link to="/Game-mode" className="hover:text-gray-400">Game Mode</Link>
              </li>
            </>

            <li>
              {isAuthenticated ? (
                <motion.button
                  onClick={handleLogout} 
                  className="bg-[#9d0208] hover:bg-[#6a040f] px-4 py-2 rounded-xl">
                  Logout
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => loginWithRedirect()} 
                  className="bg-purple-700 hover:bg-purple-950  px-4 py-2 rounded-xl ">
                  Log In
                </motion.button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
