import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Main from './components/Main'
import NavBar from './components/NavBar'
import InterviewMode from './components/InterviewMode'
import GameMode from './components/GameMode'
import InterviewRoom from './components/InterviewRoom'
import { RoleProvider } from './context/RoleContext'

const App = () => {
  return (
    <RoleProvider>
      <NavBar/>
      <div className="pt-16"></div>
      <Routes>
        <Route path="/Interview-mode" element={<InterviewMode />} />
        <Route path="/" element={<Main />} />
        <Route path="/game-mode" element={<GameMode />} />
        <Route path="/interview/:roomId" element={<InterviewRoom />} />
      </Routes>
     
    </RoleProvider>
  )
}

export default App