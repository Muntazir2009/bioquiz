"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface MovingBorderProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  duration?: number;
  borderColor?: string;
}

export function MovingBorder({
  children,
  className = "",
  active = true,
  duration = 3,
  borderColor = "rgba(46, 185, 223, 0.5)",
}: MovingBorderProps) {
  if (!active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Animated border using rotating pseudo-element */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${borderColor}, transparent, transparent)`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Inner content with background to mask the border */}
      <div className="relative z-10 m-[1px] rounded-[7px] bg-[#060608]">
        {children}
      </div>
    </div>
  );
}
