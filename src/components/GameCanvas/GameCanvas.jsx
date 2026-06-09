import { useEffect, useRef } from 'react';
import useGameStore from '../../store/gameStore';
import { renderFrame } from './renderer';

export default function GameCanvas() {
  const canvasRef = useRef(null);

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

  // render loop — reads store state directly each frame so the loop never restarts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    function loop() {
      renderFrame(ctx, canvas, useGameStore.getState());
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return <canvas ref={canvasRef} className="block w-full" />;
}
