import React, { useState, useCallback, useEffect } from 'react';
import { useCamera } from './hooks/useCamera';
import { MirrorCanvas } from './components/MirrorCanvas';
import { Controls } from './components/UI/Controls';
import { Selectors } from './components/UI/Selectors';
import { motion, AnimatePresence } from 'motion/react';
import { Beaker, Settings, X, Camera as CameraIcon } from 'lucide-react';

export default function App() {
  const { stream, error, startCamera, devices, activeDeviceId, facingMode, switchCamera } = useCamera();
  const [activeLens, setActiveLens] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);
  const [intensity, setIntensity] = useState(0.5);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLabMode, setIsLabMode] = useState(false);
  const [showCaptureFlash, setShowCaptureFlash] = useState(false);
  const [fps, setFps] = useState(0);
  const [motionEnergy, setMotionEnergy] = useState(0);

  // FPS Counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    const updateFps = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      requestAnimationFrame(updateFps);
    };
    const animId = requestAnimationFrame(updateFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleReset = useCallback(() => {
    setActiveLens(0);
    setActiveFilter(0);
    setIntensity(0.5);
    setIsFrozen(false);
    setIsCompareMode(false);
  }, []);

  const handleCapture = useCallback(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      setShowCaptureFlash(true);
      setTimeout(() => setShowCaptureFlash(false), 150);
      
      const link = document.createElement('a');
      link.download = `vayumirror-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, []);

  const handleSwitchCamera = useCallback(() => {
    switchCamera();
  }, [switchCamera]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CameraIcon className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Camera Access Required</h1>
          <p className="text-white/60 mb-8 leading-relaxed">
            To use VayuMirror, we need access to your webcam. Please enable camera permissions in your browser.
          </p>
          <button 
            onClick={() => startCamera()}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-white/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden font-sans selection:bg-white selection:text-black touch-none">
      {/* Main Rendering Layer */}
      <div 
        className="absolute inset-0 cursor-pointer active:scale-[0.99] transition-transform duration-150"
        onClick={handleCapture}
        title="Click to Capture"
      >
        <MirrorCanvas
          stream={stream}
          lensType={activeLens}
          filterType={activeFilter}
          intensity={intensity}
          isFrozen={isFrozen}
          compareMode={isCompareMode}
          facingMode={facingMode}
          onEnergyUpdate={setMotionEnergy}
        />
      </div>

      {/* Global AI Border Glow */}
      <div 
        className="fixed inset-0 pointer-events-none z-[100] border-[1px] md:border-[2px] transition-all duration-300"
        style={{
          borderColor: `rgba(255, 255, 255, ${0.1 + motionEnergy * 0.4})`,
          boxShadow: `inset 0 0 ${20 + motionEnergy * 60}px rgba(255, 255, 255, ${0.1 + motionEnergy * 0.3})`
        }}
      />

      {/* Capture Flash Effect */}
      <AnimatePresence>
        {showCaptureFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Lab Mode Overlay */}
      <AnimatePresence>
        {isLabMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-10"
          >
            {/* Grid */}
            <div className="absolute inset-0 opacity-10" 
                 style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
            
            {/* AI Perception Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-[80vh] h-[80vh] border border-white/5 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="w-[60vh] h-[60vh] border border-dashed border-white/10 rounded-full"
              />
            </div>

            {/* Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center">
              <div className="w-full h-[1px] bg-white/20 absolute" />
              <div className="h-full w-[1px] bg-white/20 absolute" />
              <div className="w-4 h-4 border-2 border-white/40 rounded-full" />
              
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40" />
            </div>

            {/* Stats - Neural Style */}
            <div className="absolute top-24 left-4 md:left-10 flex flex-col gap-4 font-mono text-[9px] text-white/50 uppercase tracking-[0.2em]">
              <div className="flex flex-col gap-1">
                <span className="text-white/80 border-b border-white/10 pb-1 mb-1">System Diagnostics</span>
                <span>Uptime: {(performance.now() / 1000).toFixed(1)}s</span>
                <span>Latency: ~16.6ms</span>
                <span>Buffer: 0x{Math.random().toString(16).slice(2, 10)}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-white/80 border-b border-white/10 pb-1 mb-1">Optical Stream</span>
                <span>FPS: <span className={fps > 55 ? "text-green-400" : "text-yellow-400"}>{fps}</span></span>
                <span>Energy: {(motionEnergy * 100).toFixed(2)}%</span>
                <span>Facing: {facingMode}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-white/80 border-b border-white/10 pb-1 mb-1">Neural Weights</span>
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${motionEnergy * 100}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
                <span>Sync: Active</span>
              </div>
            </div>

            {/* Bottom Right AI Tag */}
            <div className="absolute bottom-24 right-10 text-right font-mono text-[8px] text-white/30 uppercase tracking-[0.5em]">
              AI_PERCEPTION_ACTIVE<br/>
              VAYU_CORE_v3.2
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lab Mode Toggle */}
      <div className="fixed top-6 right-6 flex items-center gap-3 z-50">
        <button 
          onClick={() => setIsLabMode(!isLabMode)}
          className={`p-3 rounded-2xl border transition-all ${
            isLabMode ? 'bg-white text-black border-white' : 'glass text-white/70 border-white/20 hover:bg-white/20'
          }`}
        >
          <Beaker size={20} />
        </button>
      </div>

      {/* Selectors */}
      <Selectors
        activeLens={activeLens}
        setActiveLens={setActiveLens}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* Controls */}
      <Controls
        intensity={intensity}
        setIntensity={setIntensity}
        isFrozen={isFrozen}
        setIsFrozen={setIsFrozen}
        isCompareMode={isCompareMode}
        setIsCompareMode={setIsCompareMode}
        onReset={handleReset}
        onCapture={handleCapture}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        energy={motionEnergy}
        onSwitchCamera={handleSwitchCamera}
        hasMultipleCameras={devices.length > 1}
      />

      {/* Branding / Watermark */}
      <div className="fixed bottom-6 right-8 pointer-events-none opacity-30 z-50">
        <div className="flex flex-col items-end">
          <span className="text-white font-bold text-lg tracking-tighter">VAYUMIRROR PRO</span>
          <span className="text-white/60 text-[8px] font-bold uppercase tracking-[0.4em]">GPU Optical Engine v3.0</span>
        </div>
      </div>
    </div>
  );
}
