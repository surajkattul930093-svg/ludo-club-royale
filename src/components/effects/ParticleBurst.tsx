import React from 'react';

export const ParticleBurst: React.FC<{ x: number, y: number, color: string }> = ({ x, y, color }) => {
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 40 + Math.random() * 20;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    return { tx, ty, id: i, size: 4 + Math.random() * 6 };
  });

  return (
    <div className="absolute pointer-events-none z-50" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-burst"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : '#3b82f6',
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            boxShadow: '0 0 10px currentColor',
          } as React.CSSProperties}
        />
      ))}
      <div className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-white animate-flash-burst opacity-0" />
    </div>
  );
};
