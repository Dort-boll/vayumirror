import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Circle, 
  Disc, 
  Eye, 
  Zap, 
  Waves, 
  Grid,
  Sun,
  Moon,
  Palette,
  Wind,
  Cpu,
  Tv,
  Maximize,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';

export const LENSES = [
  { id: 0, name: 'Normal', icon: Circle },
  { id: 1, name: 'Convex', icon: Disc },
  { id: 2, name: 'Concave', icon: Eye },
  { id: 3, name: 'Fisheye', icon: Zap },
  { id: 4, name: 'Prism', icon: Palette },
  { id: 5, name: 'Heat Wave', icon: Waves },
  { id: 6, name: 'Crystal', icon: Grid },
  { id: 7, name: 'Liquid', icon: Wind },
];

export const FILTERS = [
  { id: 0, name: 'None', icon: Sun },
  { id: 1, name: 'Noir', icon: Moon },
  { id: 2, name: 'Sepia', icon: Wind },
  { id: 3, name: 'Neon', icon: Zap },
  { id: 4, name: 'Cyberpunk', icon: Cpu },
  { id: 5, name: 'Vintage', icon: Tv },
  { id: 6, name: 'Soft Focus', icon: Eye },
  { id: 7, name: 'HDR', icon: Maximize },
];

interface SelectorProps {
  activeLens: number;
  setActiveLens: (id: number) => void;
  activeFilter: number;
  setActiveFilter: (id: number) => void;
}

export const Selectors: React.FC<SelectorProps> = ({
  activeLens,
  setActiveLens,
  activeFilter,
  setActiveFilter
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'lenses' | 'filters'>('lenses');

  return (
    <>
      {/* Menu Toggle Header */}
      <div className="fixed top-6 left-6 z-[60] pointer-events-auto">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="glass p-3 rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] hidden sm:block">
            {isMenuOpen ? 'Close Studio' : 'Vayu Studio'}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[55] pointer-events-auto"
            />

            {/* Selection Panel */}
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="fixed left-0 md:left-6 top-0 md:top-24 bottom-0 md:bottom-24 w-full md:w-[320px] glass md:rounded-[32px] z-[60] pointer-events-auto flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 md:hidden">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Vayu Studio</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 bg-white/5">
                <button 
                  onClick={() => setActiveTab('lenses')}
                  className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'lenses' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Lenses
                </button>
                <button 
                  onClick={() => setActiveTab('filters')}
                  className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'filters' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  Filters
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <div className="grid grid-cols-3 md:grid-cols-2 gap-4">
                  {(activeTab === 'lenses' ? LENSES : FILTERS).map((item) => {
                    const isActive = activeTab === 'lenses' ? activeLens === item.id : activeFilter === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => activeTab === 'lenses' ? setActiveLens(item.id) : setActiveFilter(item.id)}
                        className={`relative aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl transition-all group ${
                          isActive 
                          ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.5)] scale-105' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="active-glow"
                            className="absolute inset-0 rounded-2xl border-2 border-white/50 animate-pulse"
                          />
                        )}
                        <item.icon size={28} className={isActive ? 'animate-pulse' : ''} />
                        <span className="text-[8px] font-bold uppercase tracking-tighter text-center px-1">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer Info */}
              <div className="p-4 border-top border-white/10 bg-white/5">
                <div className="flex items-center justify-between text-[8px] font-bold text-white/40 uppercase tracking-widest">
                  <span>Engine: Vayu_v3.2</span>
                  <span>Status: Active</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
