import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ParticleBurst {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface ParticlesProps {
  bursts: ParticleBurst[];
}

interface Particle {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  shape: 'circle' | 'star';
}

let particleId = 0;

function createParticles(burst: ParticleBurst): Particle[] {
  const count = 6 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 50;
    return {
      id: `p-${particleId++}`,
      x: burst.x,
      y: burst.y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      color: burst.color,
      size: 4 + Math.random() * 6,
      shape: Math.random() > 0.5 ? 'circle' : 'star',
    };
  });
}

export default function Particles({ bursts }: ParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (bursts.length === 0) return;
    const latest = bursts[bursts.length - 1];
    const newParticles = createParticles(latest);
    setParticles((prev) => [...prev, ...newParticles]);

    const timer = setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [bursts]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-40">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
            animate={{
              x: p.x + p.dx,
              y: p.y + p.dy,
              opacity: 0,
              scale: 0.3,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.shape === 'circle' ? '50%' : '2px',
              transform: p.shape === 'star' ? 'rotate(45deg)' : undefined,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
