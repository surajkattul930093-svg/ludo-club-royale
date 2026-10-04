import React from 'react';

interface SafeCellProps {
  color?: string; // star fill color, default black
  size?: string;
}

/**
 * 6-pointed star symbol matching the safe cells from the reference image
 */
export const SafeCellStar: React.FC<SafeCellProps> = ({
  color = '#111827',
  size = '70%',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      style={{ width: size, height: size }}
      className="pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]"
    >
      {/* 6-pointed star with clean black geometry and center circle cut/accent */}
      <polygon
        points="50,5 63,33 95,33 70,55 80,85 50,68 20,85 30,55 5,33 37,33"
        fill={color}
        stroke="#111827"
        strokeWidth="2"
      />
      <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
      <circle cx="50" cy="50" r="5" fill={color} />
    </svg>
  );
};
