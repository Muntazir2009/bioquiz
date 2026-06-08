"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface ShimmerButtonProps {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  onClick?: () => void;
}

export function ShimmerButton({
  children,
  className = "",
  shimmerColor = "rgba(46, 185, 223, 0.3)",
  onClick,
}: ShimmerButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden rounded-lg bg-[#2EB9DF]/15 px-5 py-2.5 text-sm font-medium text-[#2EB9DF] transition-colors hover:bg-[#2EB9DF]/25 ${className}`}
    >
      {/* Shimmer sweep */}
      <span
        className="absolute inset-0 z-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
