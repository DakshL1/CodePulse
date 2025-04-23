"use client";

import { animate, stagger } from "motion";
import { splitText } from "motion-plus";
import { useEffect, useRef } from "react";

export default function SplitText() {
  const containerRef = useRef(null); // No type declaration in JS

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!containerRef.current) return;

      // Hide the container until the fonts are loaded
      containerRef.current.style.visibility = "visible";

      const { words } = splitText(
        containerRef.current.querySelector("h1")
      );

      // Animate the words in the h1
      animate(
        words,
        { opacity: [0, 1], y: [10, 0] },
        {
          type: "spring",
          duration: 2,
          bounce: 0,
          delay: stagger(0.05),
        }
      );
    });
  }, []);

  return (
    <div className="container" ref={containerRef}>
      <h1 className="h1">
      Ready for a new era of interviewing?
      </h1>
      <Stylesheet />
    </div>
  );
}

function Stylesheet() {
  return (
    <style>{`
      .container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 90%;
        text-align: left;
        visibility: hidden;
      }
        .h1{
        font-family: sans-serif;
        }

      .split-word {
        will-change: transform, opacity;
      }
    `}</style>
  );
}
