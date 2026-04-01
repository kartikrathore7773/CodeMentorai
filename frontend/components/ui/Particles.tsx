"use client";

import React, { useEffect, useState } from "react";

type Particle = {
  id: number;
  left: string;
  width: string;
  height: string;
  delay: string;
  duration: string;
};

function generate(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    width: `${Math.random() * 3 + 1}px`,
    height: `${Math.random() * 3 + 1}px`,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 14}s`,
  }));
}

export default function Particles({ count = 18 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // create particles only after mount to keep server/client markup deterministic
    setParticles(generate(count));
  }, [count]);

  if (!particles.length) return <div className="pdp-hero-particles" />;

  return (
    <div className="pdp-hero-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="pdp-particle"
          style={{
            left: p.left,
            bottom: "0",
            width: p.width,
            height: p.height,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
