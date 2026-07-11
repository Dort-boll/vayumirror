import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Sliders, ArrowRight, Smartphone, Compass, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

interface IntroScreenProps {
  onEnter: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetMousePos, setTargetMousePos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [lineCount, setLineCount] = useState(30);
  const [activeIllusion, setActiveIllusion] = useState<'spiral' | 'ripples' | 'kaleido'>('spiral');
  const [isMobile, setIsMobile] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect screen size to optimize rendering densities
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setLineCount(16); // Highly performant on mobile
      } else {
        setLineCount(30); // Dynamic depth on desktop
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Soft inertia lerp system for responsive fluid mouse movement
  useEffect(() => {
    let animFrame: number;
    const updateInterpolation = () => {
      setMousePos((prev) => {
        const dx = targetMousePos.x - prev.x;
        const dy = targetMousePos.y - prev.y;
        const speed = isMobile ? 0.05 : 0.08;
        return {
          x: prev.x + dx * speed,
          y: prev.y + dy * speed
        };
      });
      animFrame = requestAnimationFrame(updateInterpolation);
    };
    animFrame = requestAnimationFrame(updateInterpolation);
    return () => cancelAnimationFrame(animFrame);
  }, [targetMousePos, isMobile]);

  // Hypnotic rotational velocity generator
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setRotation((prev) => (prev + 0.35) % 360);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTargetMousePos({ x, y });
    if (showGuide) setShowGuide(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) / rect.width - 0.5;
    const y = (touch.clientY - rect.top) / rect.height - 0.5;
    setTargetMousePos({ x, y });
    if (showGuide) setShowGuide(false);
  };

  // Helper to generate a multi-arm logarithmic/Archimedean spiral path
  const generateHypnoSpirals = (arms: number, turns: number, points: number, scale: number) => {
    const paths = [];
    const pointsPerArm = Math.max(15, points);

    for (let a = 0; a < arms; a++) {
      const armAngleOffset = (a * 2 * Math.PI) / arms;
      const pathCoordinates = [];

      for (let p = 0; p <= pointsPerArm; p++) {
        const t = p / pointsPerArm; // 0 to 1 progress
        const angle = t * turns * 2 * Math.PI + armAngleOffset;
        
        // Logarithmic scale for trippy infinite-tunnel projection
        const radius = Math.pow(t, 1.3) * scale;
        
        const x = 100 + radius * Math.cos(angle);
        const y = 100 + radius * Math.sin(angle);
        
        pathCoordinates.push(`${p === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
      }
      paths.push(pathCoordinates.join(' '));
    }
    return paths;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={() => setShowGuide(false)}
      className="relative w-full h-[100dvh] bg-[#020204] text-white flex flex-col justify-between p-4 sm:p-6 overflow-hidden font-sans select-none touch-none"
    >
      
      {/* ------------------- BACKGROUND LAYER: MESMERIZING HYPNOTIC ILLUSIONS ------------------- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Dynamic Fluid Color Wells */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full filter blur-[140px] opacity-25 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 transition-transform duration-1000 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * 250}px, ${mousePos.y * 250}px, 0)`,
            left: 'calc(50% - 300px)',
            top: 'calc(50% - 300px)',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full filter blur-[120px] opacity-20 bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 transition-transform duration-1000 ease-out"
          style={{
            transform: `translate3d(${-mousePos.x * 200}px, ${-mousePos.y * 200}px, 0)`,
            left: 'calc(50% - 250px)',
            top: 'calc(50% - 250px)',
          }}
        />

        {/* 1. ARCHIMEDEAN HYPNOTIC SPIRAL (Infinite depth tunnel) */}
        {activeIllusion === 'spiral' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-40 md:opacity-50">
            {/* Clockwise rotating spiral */}
            <svg 
              className="absolute w-[140vmax] h-[140vmax] text-blue-500/25" 
              viewBox="0 0 200 200"
              style={{
                transform: `translate3d(${mousePos.x * 120}px, ${mousePos.y * 120}px, 0) rotate(${rotation * 1.5}deg)`,
                transformOrigin: 'center'
              }}
            >
              {generateHypnoSpirals(6, 4, lineCount * 2, 95).map((path, index) => (
                <path 
                  key={`spiral-cw-${index}`}
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {/* Counter-Clockwise rotating spiral (creates gorgeous, trippy Moire/interference patterns when overlapping) */}
            <svg 
              className="absolute w-[150vmax] h-[150vmax] text-purple-400/20" 
              viewBox="0 0 200 200"
              style={{
                transform: `translate3d(${mousePos.x * -90}px, ${mousePos.y * -90}px, 0) rotate(${-rotation * 1.8}deg)`,
                transformOrigin: 'center'
              }}
            >
              {generateHypnoSpirals(6, 4, lineCount * 2, 95).map((path, index) => (
                <path 
                  key={`spiral-ccw-${index}`}
                  d={path}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
        )}

        {/* 2. CONCENTRIC RIPPLE WAVES (Bending optical field) */}
        {activeIllusion === 'ripples' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30 md:opacity-45">
            {Array.from({ length: isMobile ? 18 : 32 }).map((_, i) => {
              const progress = i / (isMobile ? 18 : 32);
              const scale = 0.05 + progress * 2.2;
              
              // Wave offset to simulate liquid dynamic refraction
              const waveOffset = Math.sin(rotation * 0.08 - progress * 10) * 12;

              return (
                <div
                  key={`ripple-${i}`}
                  className="absolute rounded-full border-2 border-dashed flex items-center justify-center"
                  style={{
                    width: `calc(${scale * 100}vw + ${waveOffset}px)`,
                    height: `calc(${scale * 100}vw + ${waveOffset}px)`,
                    opacity: 0.04 + (1.0 - progress) * 0.35,
                    transform: `translate3d(${mousePos.x * (1.0 - progress) * 180}px, ${mousePos.y * (1.0 - progress) * 180}px, 0) rotate(${rotation * 0.3}deg)`,
                    borderColor: i % 2 === 0 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(236, 72, 153, 0.3)',
                    willChange: 'transform'
                  }}
                />
              );
            })}
          </div>
        )}

        {/* 3. PULSING KALEIDOSCOPIC GEARS (Shifting geometric mandala) */}
        {activeIllusion === 'kaleido' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30 md:opacity-40">
            {Array.from({ length: isMobile ? 6 : 10 }).map((_, i) => {
              const scale = 0.2 + (i * 0.25);
              const starPoints = 8 + (i % 2 === 0 ? 4 : 0);
              
              return (
                <div
                  key={`kaleido-${i}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    width: `${scale * 100}vmax`,
                    height: `${scale * 100}vmax`,
                    transform: `translate3d(${mousePos.x * (10 - i) * 15}px, ${mousePos.y * (10 - i) * 15}px, 0) rotate(${rotation * (i % 2 === 0 ? 0.8 : -0.8) + (i * 45)}deg)`,
                    willChange: 'transform'
                  }}
                >
                  <svg className="w-full h-full text-indigo-400/15" viewBox="0 0 100 100">
                    <polygon
                      points={Array.from({ length: starPoints * 2 }).map((_, p) => {
                        const angle = (p * Math.PI) / starPoints;
                        const r = p % 2 === 0 ? 45 : 20;
                        const px = 50 + r * Math.cos(angle);
                        const py = 50 + r * Math.sin(angle);
                        return `${px.toFixed(1)},${py.toFixed(1)}`;
                      }).join(' ')}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </div>
              );
            })}
          </div>
        )}

        {/* Sophisticated light technical coordinates grid */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:45px_45px]"
          style={{
            transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0)`,
          }}
        />

      </div>

      {/* ------------------- HEADER ------------------- */}
      <header className="z-10 flex justify-between items-center w-full max-w-7xl mx-auto px-2">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-white to-neutral-200 text-black flex items-center justify-center font-black text-base shadow-md">
            V
          </div>
          <div>
            <span className="font-black text-xs tracking-wider uppercase block text-white/90">VAYU</span>
            <span className="text-[8px] text-white/40 block uppercase tracking-widest">OPTICAL CALIBRATION</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center"
        >
          <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-mono tracking-widest text-white/50 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-400 animate-ping" />
            STABLE_PRO_v3.2
          </span>
        </motion.div>
      </header>

      {/* ------------------- MAIN COMPONENT: SLEEK, COMPACT & IMPRESSIVE GLASS PANEL ------------------- */}
      <main className="z-10 flex flex-col items-center justify-center my-auto w-full max-w-md mx-auto px-2 py-4">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', damping: 18 }}
          className="w-full bg-black/40 backdrop-blur-[40px] border border-white/15 rounded-[28px] p-5 sm:p-6 shadow-2xl text-center relative overflow-hidden"
          style={{
            transform: `perspective(800px) rotateX(${-mousePos.y * 8}deg) rotateY(${mousePos.x * 8}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.1, 0.8, 0.2, 1)',
            boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(255,255,255,0.12), inset 0 0 30px rgba(255,255,255,0.01)'
          }}
        >
          {/* Subtle color highlight inside glass box */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-pink-500/5 opacity-40 pointer-events-none rounded-[28px]" />

          {/* Clean minimal corner coordinates */}
          <div className="absolute top-5 left-5 w-4 h-4 border-t border-l border-white/20 rounded-tl" />
          <div className="absolute top-5 right-5 w-4 h-4 border-t border-r border-white/20 rounded-tr" />
          <div className="absolute bottom-5 left-5 w-4 h-4 border-b border-l border-white/20 rounded-bl" />
          <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r border-white/20 rounded-br" />

          {/* Interactive touch/drag guide badge */}
          <AnimatePresence>
            {showGuide && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-5 left-1/2 -translate-x-1/2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md"
              >
                <Smartphone size={10} className="animate-bounce" />
                Drag screen to warp dimensions
              </motion.div>
            )}
          </AnimatePresence>

          {/* Micro Tag */}
          <div className="mb-3.5 mt-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-white/70">
              <Sparkles size={9} className="text-amber-400" />
              Hypnotic Portal Calibrator
            </span>
          </div>

          {/* Main Title & Dynamic responsive subtitle */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none">
            VayuMirror
            <span className="block mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 font-mono tracking-[0.25em] text-[10px] md:text-xs font-bold">
              // OPTICAL LAB //
            </span>
          </h1>

          <p className="mt-3 text-white/60 text-[11px] leading-relaxed max-w-sm mx-auto">
            Experience real-time WebGL refractive lenses, light-wave moiré interferences, and beautiful hypnotic geometries.
          </p>

          {/* ------------------- INTERACTIVE CONTROL MODULE (Combined, Compact & Beautiful) ------------------- */}
          <div className="mt-6 space-y-3 text-left">
            
            {/* Illusion Selection with compact layout */}
            <div className="bg-white/[0.02] border border-white/8 p-3 rounded-2xl">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-2 block flex items-center gap-1">
                <Compass size={10} className="text-blue-400" />
                Hypnotic Geometries
              </span>
              
              <div className="flex gap-1">
                {(['spiral', 'ripples', 'kaleido'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setActiveIllusion(type);
                      if (type === 'spiral') {
                        setLineCount(isMobile ? 16 : 30);
                      } else if (type === 'ripples') {
                        setLineCount(isMobile ? 18 : 32);
                      } else {
                        setLineCount(isMobile ? 6 : 10);
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all border ${
                      activeIllusion === type 
                        ? 'bg-white text-black border-white shadow-md' 
                        : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {type === 'spiral' ? '🌀 Spiral' : type === 'ripples' ? '🌊 Ripples' : '💎 Kaleido'}
                  </button>
                ))}
              </div>
            </div>

            {/* Density / Frequency controller */}
            <div className="bg-white/[0.02] border border-white/8 p-3 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1">
                  <Sliders size={10} className="text-purple-400" />
                  Grid Frequency
                </span>
                <span className="text-[9px] font-mono text-indigo-300/80 font-bold">{lineCount} elements</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg flex-1 max-w-[150px]">
                <input 
                  type="range" 
                  min={activeIllusion === 'kaleido' ? "4" : "10"} 
                  max={activeIllusion === 'kaleido' ? "15" : "50"} 
                  value={lineCount}
                  onChange={(e) => setLineCount(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

          </div>

          {/* Premium Trigger Button */}
          <div className="mt-6">
            <button
              onClick={onEnter}
              className="group relative px-8 py-4 w-full bg-gradient-to-r from-white to-neutral-200 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.25em] overflow-hidden hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 border border-white/20"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-1.5">
                START OPTICAL STREAM
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </button>
          </div>

          {/* Reactive Bottom Diagnostics bar */}
          <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-white/30 tracking-widest uppercase">
            <span>WARP: {((Math.abs(mousePos.x) + Math.abs(mousePos.y)) * 100).toFixed(0)}%</span>
            <span>STATUS: READY</span>
          </div>

        </motion.div>
      </main>

      {/* ------------------- FOOTER ------------------- */}
      <footer className="z-10 w-full border-t border-white/5 pt-4 pb-1 max-w-7xl mx-auto px-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 text-center sm:text-left">
          <span className="text-[8px] text-white/30 font-mono tracking-widest uppercase">
            VAYU OPTICS LAB // FULL_SCREEN REALTIME SHADER SIMULATOR
          </span>
          <div className="flex gap-4 flex-wrap justify-center">
            <div className="flex items-center gap-1">
              <Layers size={10} className="text-purple-400" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-white/50">Glassmorphic Render</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
