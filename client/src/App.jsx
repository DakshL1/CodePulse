// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import NavBar from './components/NavBar';
import InterviewMode from './components/InterviewMode';
import GameMode from './components/GameMode';
import InterviewRoom from './components/InterviewRoom';
import { RoleProvider } from './context/RoleContext';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <RoleProvider>
      <NavBar />
      <div className="pt-16"></div>
      <Routes>
        <Route path="/" element={<Main />} />
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
