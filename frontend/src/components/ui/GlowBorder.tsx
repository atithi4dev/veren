import React, { useRef } from "react";
import "./GlowBorder.css";

interface GlowBorderProps {
  className?: string;
  children: React.ReactNode;
}

const GlowBorder: React.FC<GlowBorderProps> = ({ className = "", children }) => {
  const boxRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={boxRef}
      className={`relative overflow-hidden ${className} group`}
    >
      {/* Animated border */}
      <span className="glow-border-anim pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlowBorder;
