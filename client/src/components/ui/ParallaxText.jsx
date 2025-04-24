import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue, useVelocity, useAnimationFrame } from "framer-motion";
import { wrap } from "@motionone/utils";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Plaster&display=swap";
document.head.appendChild(fontLink);


// CSS styles in JavaScript (only necessary styles for ParallaxText)
const styles = `
  body {
    --purple: #9900ff;
    --white: #fafafa;
    margin: 0;
    padding: 0;
    background-color: var(--background);
    color: var(--accent);
  }

  .parallax {
    overflow: hidden;
    letter-spacing: -2px;
    line-height: 0.8;
    margin: 0;
    white-space: nowrap;
    display: flex;
    flex-wrap: nowrap;
    font-family: "Plaster";
    width: 100vw; /* Full width of the screen */
  }

  .parallax .scroller {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 64px;
    display: flex;
    white-space: nowrap;
    flex-wrap: nowrap;
    -webkit-font-smoothing: antialiased;
    font-family: "Plaster", sans-serif;
    width: 100vw; 
  }

  .parallax span {
    display: block;
    
  }
`;


// Inject styles into the document head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const ParallaxText = ({ children, baseVelocity = 100 }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="parallax">
      <motion.div className="scroller" style={{ x }}>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
      </motion.div>
    </div>
  );
};

export default ParallaxText;
