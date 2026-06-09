import { useEffect, useRef } from 'react';
import useGameStore from '../../store/gameStore';
import { renderFrame } from './renderer';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const gameState = useGameStore();

  // resize canvas to maintain 16:9
  useEffect(() => {
    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      const w = parent.clientWidth;
      const h = Math.round((w * 9) / 16);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function loop() {
      renderFrame(ctx, canvas, gameState);
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  });

  return <canvas ref={canvasRef} className="block w-full" />;
}
