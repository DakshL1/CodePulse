import React, { useState, useEffect, useRef } from "react";
import handSvg from "../assets/hand.svg";
import personSvg from "../assets/person.svg";
import SplitText from "./ui/SplitText";
import ParallaxText from "./ui/ParallaxText";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);
  const handRef = useRef(null);
  
  const handleRoute = () => {
    navigate("/Home");
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!handRef.current) return;
      
      // Calculate rotation based on cursor position
      // Get window width and calculate percentage
      const windowWidth = window.innerWidth;
      const cursorPosition = e.clientX;
      const positionPercentage = (cursorPosition / windowWidth);
      
      // Map the percentage to a rotation range (e.g., -15 to 15 degrees)
      const rotationRange = 20; // Total range in degrees
      const newRotation = (positionPercentage - 0.5) * rotationRange;
      
      setRotation(newRotation);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans-serif box-border overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full text-center grid grid-cols-2 relative gap-0 m-0 p-0 overflow-hidden">
        <span className="flex flex-col justify-center items-center gap-0 m-0 p-0">
          <h1 className="text-4xl font-bold">
            Welcome to 
          </h1>
          <span className="text-9xl text-purple-500">CodePulse</span>
          <p className="text-gray-300 text-lg md:text-xl mb-10">
            Real-time coding. Competitive challenges. AI-proctored interviews. <br />All in one.
          </p>
         
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-2xl text-white text-lg transition duration-300"
            onClick={handleRoute}
          >
            Get Started →
          </motion.button>
        </span>

        {/* Images and SplitText */}
        <div className="relative w-full overflow-hidden flex justify-center items-center">
          {/* Transform only applies rotation to the hand SVG based on cursor position */}
          <div 
            ref={handRef} 
            style={{ 
              position: 'absolute',
              width: '88%',
              height: 'fit-content',
              zIndex: 20,
              top: '5.5%',
              right: '14.5%',
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center', // Rotate around center of palm
              transition: 'transform 0.1s ease-out' // Smooth rotation
            }}
          >
            <img
              src={handSvg}
              alt="Hand SVG"
              className="w-full h-full max-w-none"
            />
          </div>
          <img src={personSvg} alt="Person SVG" className="w-fit h-fit max-w-full" />
          <span className="absolute w-[24%] top-[18.5%] right-[19.55%]">
            <SplitText />
          </span>
        </div>

        {/* Parallax Section */}
        <div className="absolute col-span-2 col-start-1 row-span-1 row-start-2 m-0 p-0 z-30 bottom-2 w-screen overflow-hidden">
          <ParallaxText baseVelocity={-5}>INTERVIEWS?</ParallaxText>
          <ParallaxText baseVelocity={5}>CodePulse</ParallaxText>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-zinc-900 px-6">
        <h2 className="text-3xl font-semibold text-center mb-14">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-zinc-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Real-time Code Sync</h3>
            <p className="text-gray-300">Collaborate live using CodeMirror and Socket.io.</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Game Mode</h3>
            <p className="text-gray-300">Compete in timed coding battles with chat.</p>
          </div>
          <div className="bg-zinc-800 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-2">AI Proctoring</h3>
            <p className="text-gray-300">Distraction and tab monitoring to ensure fairness.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 px-6 lg:px-32">
        <h2 className="text-3xl font-semibold text-center mb-12">How CodePulse Works</h2>
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-bold mb-2">1. Join a Room</h3>
            <p className="text-gray-300">Choose your mode — interview or game — and enter a room.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">2. Start Coding</h3>
            <p className="text-gray-300">Code in real time with live syncing and collaboration.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">3. Get Proctored</h3>
            <p className="text-gray-300">
              Advanced AI checks for distraction, eye movement, and more. (Only in interview mode)
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-zinc-950 text-center py-10 text-gray-400 text-sm">
        © 2025 CodePulse. Built for next-gen coding interview experiences.
      </footer>
    </div>
  );
};

export default LandingPage;