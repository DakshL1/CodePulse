// App.js
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Main from './components/Main';
import NavBar from './components/NavBar';
import InterviewMode from './components/InterviewMode';
import GameMode from './components/GameMode';
import InterviewRoom from './components/InterviewRoom';
import { RoleProvider } from './context/RoleContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './components/LandingPage';

const App = () => {
  const location = useLocation();
  
  // Check if path matches /interview/:roomId (like /interview/abc123)
  const isInterviewRoom = /^\/interview\/[^/]+$/.test(location.pathname) ;

  return (
    <RoleProvider>
      {!isInterviewRoom && <NavBar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Home" element={<Main />} />
        
        <Route path="/Interview-mode" element={
          <PrivateRoute>
            <InterviewMode />
          </PrivateRoute>
        } />
        <Route path="/game-mode" element={
          <PrivateRoute>
            <GameMode />
          </PrivateRoute>
        } />
        <Route path="/interview/:roomId" element={
          <PrivateRoute>
            <InterviewRoom />
          </PrivateRoute>
        } />
      </Routes>
    </RoleProvider>
  );
};

export default App;
