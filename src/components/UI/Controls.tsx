import React from 'react';
import { Camera, Snowflake, RefreshCw, Maximize, Minimize, Download, Info, Columns, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ControlsProps {
  intensity: number;
  setIntensity: (val: number) => void;
  isFrozen: boolean;
  setIsFrozen: (val: boolean) => void;
  isCompareMode: boolean;
  setIsCompareMode: (val: boolean) => void;
  onReset: () => void;
  onCapture: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  energy: number;
  onSwitchCamera: () => void;
  hasMultipleCameras: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  intensity,
  setIntensity,
  isFrozen,
  setIsFrozen,
  isCompareMode,
  setIsCompareMode,
  onReset,
  onCapture,
  isFullscreen,
  toggleFullscreen,
  energy,
  onSwitchCamera,
  hasMultipleCameras
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1 + energy * 0.05
      }}
      className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 md:gap-6 z-50 w-full max-w-md px-4"
    >
      {/* Intensity Slider */}
      <div 
        className="glass w-full rounded-3xl p-4 md:p-5 shadow-2xl transition-all duration-300"
        style={{
          borderColor: `rgba(255, 255, 255, ${0.2 + energy * 0.5})`,
          boxShadow: `0 0 ${30 + energy * 50}px rgba(255, 255, 255, ${energy * 0.25})`
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">Optical Intensity</span>
          <span className="text-[var(--text-primary)] font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{Math.round(intensity * 100)}%</span>
        </div>
        <div className="relative flex items-center h-6">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div 
        className="glass flex items-center gap-1 md:gap-3 rounded-full p-1.5 md:p-2 shadow-2xl transition-all duration-300"
        style={{
          borderColor: `rgba(255, 255, 255, ${0.2 + energy * 0.5})`,
        }}
      >
        <button
          onClick={() => setIsFrozen(!isFrozen)}
          className={`p-3 rounded-full transition-all ${isFrozen ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}
          title="Freeze Feed"
        >
          <Snowflake size={20} />
        </button>

        <button
          onClick={() => setIsCompareMode(!isCompareMode)}
          className={`p-3 rounded-full transition-all ${isCompareMode ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'text-[var(--text-secondary)] hover:bg-white/10'}`}
          title="Compare Mode"
        >
          <Columns size={20} />
        </button>

        <button
          onClick={onSwitchCamera}
          className="p-3 rounded-full text-[var(--text-secondary)] hover:bg-white/10 transition-all"
          title="Switch Camera"
        >
          <RefreshCw size={20} />
        </button>
        
        <button
          onClick={onReset}
          className="p-3 rounded-full text-[var(--text-secondary)] hover:bg-white/10 transition-all mobile-hide"
          title="Reset Effects"
        >
          <RefreshCw size={20} className="rotate-45" />
        </button>

        <button
          onClick={onCapture}
          className="p-4 bg-white text-black rounded-full hover:scale-110 active:scale-90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
          title="Capture & Download"
        >
          <Camera size={24} />
          <Download size={16} className="opacity-40 hidden md:block" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-full text-[var(--text-secondary)] hover:bg-white/10 transition-all mobile-hide"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        <button
          onClick={() => {}} 
          className="p-3 rounded-full text-[var(--text-secondary)] hover:bg-white/10 transition-all"
          title="Lab Info"
        >
          <Info size={20} />
        </button>
      </div>
    </motion.div>
  );
};
