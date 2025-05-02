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
          <span className="absolute w-[24%] top-[18.5%] right-[19%]">
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
  <h2 className="text-4xl font-bold text-center mb-16 tracking-wide">Core Features</h2>
  <div className="grid md:grid-cols-3 gap-10">
    
    <div className="bg-zinc-800 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <h3 className="text-2xl font-semibold mb-4 group-hover:text-zinc-400 transition-colors">Real-time Code Sync</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Collaborate live with seamless synchronization using CodeMirror and Socket.io.
      </p>
    </div>

    <div className="bg-zinc-800 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <h3 className="text-2xl font-semibold mb-4 group-hover:text-zinc-400 transition-colors">Game Mode</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Compete in thrilling timed battles with live chat and language selection.
      </p>
    </div>

    <div className="bg-zinc-800 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <h3 className="text-2xl font-semibold mb-4 group-hover:text-zinc-400 transition-colors">AI Proctoring</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Face tracking, tab monitoring, and voice detection ensure fair interviews.
      </p>
    </div>

  </div>
</section>

      {/* How It Works Section */}
      <section className="w-full py-20 px-6 lg:px-32  text-white">
  <h2 className="text-4xl font-bold text-center mb-16 tracking-wide">How CodePulse Works</h2>
  <div className="grid md:grid-cols-3 gap-12 text-center">
    
    <div className="p-6 bg-zinc-900 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
      <div className="text-5xl mb-4 text-zinc-300 font-extrabold">1</div>
      <h3 className="text-2xl font-semibold mb-3">Join a Room</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Choose your mode — Interview or Game — and enter a room.
        For Interview Mode, the interviewer must join first. Both users should enter the same room name and click "Join".
      </p>
    </div>
    
    <div className="p-6 bg-zinc-900 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
      <div className="text-5xl mb-4 text-zinc-300 font-extrabold">2</div>
      <h3 className="text-2xl font-semibold mb-3">Start Coding</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Code in real time with seamless syncing and collaborative features built for productivity.
      </p>
    </div>
    
    <div className="p-6 bg-zinc-900 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
      <div className="text-5xl mb-4 text-zinc-300 font-extrabold">3</div>
      <h3 className="text-2xl font-semibold mb-3">Get Proctored</h3>
      <p className="text-gray-300 text-sm leading-relaxed">
        Our advanced AI watches for distractions, tracks eye movement, and more — available in Interview Mode only.
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