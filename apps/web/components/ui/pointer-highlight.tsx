"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

export const PointerHighlight = ({
  children,
  containerClassName,
  rectangleClassName,
  pointerClassName,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  rectangleClassName?: string;
  pointerClassName?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <div
      className={`relative inline-block cursor-none ${containerClassName || ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div
        className={`relative z-10 transition-colors duration-300 rounded-md px-2 border ${rectangleClassName || ""}`}
      >
        {children}
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              x: smoothX,
              y: smoothY,
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="1"
              viewBox="0 0 16 16"
              className={`transform -scale-x-100 -translate-x-1 -translate-y-1 ${pointerClassName || "w-6 h-6 text-white"}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
