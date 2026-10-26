import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  phase: number;
  phaseSpeed: number;
  baseAlpha: number;
  color: string;
  isDiamond?: boolean;
  diamondSize?: number;
  rotation?: number;
  rotSpeed?: number;
}

export const CosmicParticles: React.FC<{ particleCount?: number; style?: any }> = ({
  particleCount = 50,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const colors = [
      'rgba(255, 255, 255, ',
      'rgba(103, 232, 249, ', // Cyan / Pearl Blue
      'rgba(244, 114, 182, ', // Pink / Rose
      'rgba(251, 191, 36, ',  // Amber / Gold
      'rgba(192, 132, 252, ', // Purple
    ];

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const isDiamond = i % 7 === 0;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: isDiamond ? 2.5 : Math.random() * 1.5 + 0.6,
        speedY: -(Math.random() * 12 + 4) / 60, // slow upward drift
        speedX: (Math.random() - 0.5) * 6 / 60,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: (Math.random() * 0.8 + 0.4) / 60,
        baseAlpha: isDiamond ? 0.75 : Math.random() * 0.4 + 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        isDiamond,
        diamondSize: isDiamond ? Math.random() * 6 + 6 : 0,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      });
    }

    // Helper to draw 4-pointed diamond star flare
    const drawDiamond = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      alpha: number,
      rot: number,
      colorPrefix: string
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);

      // Core glow
      const grad = c.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
      grad.addColorStop(0, `${colorPrefix}${alpha})`);
      grad.addColorStop(0.5, `${colorPrefix}${alpha * 0.4})`);
      grad.addColorStop(1, `${colorPrefix}0)`);
      c.fillStyle = grad;
      c.beginPath();
      c.arc(0, 0, size * 1.5, 0, Math.PI * 2);
      c.fill();

      // Sharp 4-point diamond
      c.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.2)})`;
      c.beginPath();
      c.moveTo(0, -size);
      c.lineTo(size * 0.28, 0);
      c.lineTo(0, size);
      c.lineTo(-size * 0.28, 0);
      c.closePath();
      c.fill();

      c.beginPath();
      c.moveTo(-size * 0.7, 0);
      c.lineTo(0, size * 0.18);
      c.lineTo(size * 0.7, 0);
      c.lineTo(0, -size * 0.18);
      c.closePath();
      c.fill();

      c.restore();
    };

    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.phaseSpeed * (dt * 60);
        p.y += p.speedY * (dt * 60);
        p.x += p.speedX * (dt * 60) + Math.sin(p.phase * 0.5) * 0.12;

        if (p.isDiamond && p.rotSpeed) {
          p.rotation = (p.rotation || 0) + p.rotSpeed * (dt * 60);
        }

        // Wrap around bounds smoothly
        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 20) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 10;
        else if (p.x > width + 20) p.x = -10;

        const alpha = Math.max(
          0.05,
          Math.min(1, p.baseAlpha * (0.6 + 0.4 * Math.sin(p.phase)))
        );

        if (p.isDiamond && p.diamondSize) {
          drawDiamond(ctx, p.x, p.y, p.diamondSize, alpha, p.rotation || 0, p.color);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount]);

  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
});
