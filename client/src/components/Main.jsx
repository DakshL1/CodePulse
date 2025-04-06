import React from 'react';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

const Main = () => {
  const navigate = useNavigate();

  const handleGameModeClick = () => {
    navigate('/game-mode');
  };

  const handleInterviewModeClick = () => {
    navigate('/Interview-mode');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-900 to-gray-800">
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Interview Mode Section */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text ">
                Interview Mode
              </h1>
              <p className="text-gray-300 leading-relaxed">
                Interview Mode provides a structured environment for conducting coding assessments in real-time. It includes live video calls, real-time coding collaboration, and instant messaging between interviewers and candidates. The system ensures a seamless experience with features like role-based access, automated proctoring, and code execution, enabling fair and efficient evaluations.
              </p>
              <button
                onClick={handleInterviewModeClick}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
              >
                Interview Mode
              </button>
            </div>
          </div>

          {/* Game Mode Section */}
          <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-green-500 to-green-400 bg-clip-text ">
                Game Mode
              </h1>
              <p className="text-gray-300 leading-relaxed">
                Game Mode features two separate code compilers for each player, enabling them to compete on a coding challenge of their choice. It promotes interactive learning by allowing both players to solve problems simultaneously and see who finishes first.
              </p>
              <button
                onClick={handleGameModeClick}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
              >
                Game Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;