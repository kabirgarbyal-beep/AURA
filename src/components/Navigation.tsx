import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ActivePage, PAGE_TO_PATH } from '../types';
import { Menu, X, Volume2, VolumeX } from 'lucide-react';

interface NavigationProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  scrollProgress: number;
}

export default function Navigation({ activePage, setActivePage, scrollProgress }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const toggleSoundscape = () => {
    if (soundActive) {
      // Fade out smoothly
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        const gainNode = gainNodeRef.current;
        try {
          gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
        } catch (e) {}
        
        const oscs = oscillatorsRef.current;
        setTimeout(() => {
          oscs.forEach(o => { try { o.stop(); } catch(e){} });
          try { ctx.close(); } catch(e){}
        }, 1300);
      }
      oscillatorsRef.current = [];
      gainNodeRef.current = null;
      audioCtxRef.current = null;
      setSoundActive(false);
    } else {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        const mainGain = ctx.createGain();
        gainNodeRef.current = mainGain;
        mainGain.gain.setValueAtTime(0, ctx.currentTime);
        mainGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 2.5);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        const freqs = [110.00, 165.00, 220.00, 275.00, 330.00]; // Luxurious warm A minor 7 / E9 resonance
        const oscs: OscillatorNode[] = [];

        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();

          osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);

          // Subtle slow detune modulator LFO
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.06 + Math.random() * 0.08, ctx.currentTime);
          lfoGain.gain.setValueAtTime(5, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.detune);
          lfo.start();

          oscGain.gain.setValueAtTime(0.14, ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(filter);
          osc.start();

          oscs.push(osc);
        });

        filter.connect(mainGain);
        mainGain.connect(ctx.destination);
        oscillatorsRef.current = oscs;
        setSoundActive(true);
      } catch (err) {
        console.error("Failed to start soundscape:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch(e){}
      }
    };
  }, []);

  const pages: { id: ActivePage; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Story' },
    { id: 'projects', label: 'Gallery' },
    { id: 'services', label: 'Islands' },
    { id: 'process', label: 'Blueprint' },
    { id: 'blog', label: 'Editorial' },
    { id: 'contact', label: 'Contact' },
  ];


  useEffect(() => {
    // Animate header entry
    gsap.fromTo('.nav-header', 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: 3.5 }
    );
  }, []);

  const handlePageSelect = (pageId: ActivePage) => {
    setMobileMenuOpen(false);
    
    // Trigger custom page transition (curtain slide or fade)
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
      const tl = gsap.timeline();
      
      // Animate transition slide down
      tl.to(overlay, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.6,
        ease: 'power3.in',
      });
      
      // Change page under the curtain
      tl.add(() => {
        setActivePage(pageId);
        const urlPath = pageId === 'home' ? '/' : `/${PAGE_TO_PATH[pageId]}`;
        window.history.pushState(null, '', urlPath);
        window.scrollTo(0, 0);
      });
      
      // Animate transition slide up/away
      tl.to(overlay, {
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        duration: 0.8,
        ease: 'power4.out',
        delay: 0.1,
      });
    } else {
      setActivePage(pageId);
      const urlPath = pageId === 'home' ? '/' : `/${PAGE_TO_PATH[pageId]}`;
      window.history.pushState(null, '', urlPath);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gold-text z-[1000] transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Global Page Transition Curtain */}
      <div 
        className="page-transition-overlay fixed inset-0 bg-luxury-black blueprint-grid z-[9990] pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="w-16 h-16 border border-gold-text/20 rounded-full border-t-gold-text animate-spin mb-4" />
          <p className="font-serif text-lg tracking-[0.2em] text-gold-text uppercase">COMPILING SPACE</p>
        </div>
      </div>

      {/* Self-contained premium soundwave keyframe animations */}
      <style>{`
        @keyframes soundwave {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .soundwave-bar-1 { animation: soundwave 0.7s infinite ease-in-out; }
        .soundwave-bar-2 { animation: soundwave 1.1s infinite ease-in-out 0.2s; }
        .soundwave-bar-3 { animation: soundwave 0.8s infinite ease-in-out 0.4s; }
      `}</style>

      <header className="nav-header fixed top-0 left-0 w-full z-50 px-6 py-4 md:px-12 md:py-6 flex items-center justify-between glass-panel border-b border-white/5 opacity-0">
        {/* Brand Logo - Styled letter-by-letter */}
        <button 
          onClick={() => handlePageSelect('home')} 
          className="flex items-baseline space-x-2 text-left group hover-target"
        >
          <span className="font-serif text-2xl tracking-[0.25em] text-f7f5f0 uppercase font-light transition-all duration-300 group-hover:text-gold-text">
            Aura
          </span>
          <span className="font-mono text-[9px] tracking-widest text-gold-muted uppercase opacity-60">
            [Studio]
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePageSelect(p.id)}
              className={`relative py-2 font-sans text-xs uppercase tracking-[0.25em] transition-colors duration-300 hover-target ${
                activePage === p.id ? 'text-gold-text font-medium' : 'text-f7f5f0/60 hover:text-f7f5f0'
              }`}
            >
              {p.label}
              {activePage === p.id && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold-text" />
              )}
            </button>
          ))}
        </nav>

        {/* Controls: Audio Toggler + Mobile Menu */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Elite Soundscape Toggler (Desktop & Tablet) */}
          <button
            onClick={toggleSoundscape}
            className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-white/5 border border-white/10 hover:border-gold-text/50 transition-all duration-300 rounded-none group hover-target"
            title="Toggle procedural luxury soundscape"
          >
            {soundActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-gold-text" />
                <div className="flex items-end gap-[2px] h-4 w-4">
                  <div className="w-[1.5px] bg-gold-text soundwave-bar-1" />
                  <div className="w-[1.5px] bg-gold-text soundwave-bar-2" />
                  <div className="w-[1.5px] bg-gold-text soundwave-bar-3" />
                </div>
                <span className="font-mono text-[9px] tracking-[0.2em] text-gold-text uppercase">AMB_PAD // ENGAGED</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-gold-muted/60 group-hover:text-gold-text transition-colors" />
                <span className="font-mono text-[9px] tracking-[0.2em] text-gold-muted/60 group-hover:text-gold-text uppercase transition-colors">SOUNDSCAPE // OFF</span>
              </>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-f7f5f0 hover:text-gold-text transition-colors duration-300 hover-target"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-luxury-black/95 blueprint-grid backdrop-blur-2xl md:hidden flex flex-col justify-center px-10">
          <div className="flex flex-col space-y-6">
            <p className="font-mono text-[9px] tracking-[0.3em] text-gold-muted uppercase border-b border-gold-muted/15 pb-2">
              NAVIGATION SYSTEM
            </p>
            {pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => handlePageSelect(p.id)}
                style={{ animationDelay: `${idx * 0.1}s` }}
                className={`text-left font-serif text-3xl tracking-[0.1em] uppercase transition-all duration-300 ${
                  activePage === p.id ? 'text-gold-text translation-x-2' : 'text-f7f5f0/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-gold-muted/15 flex flex-col space-y-2">
            <span className="font-mono text-[10px] text-gold-muted">COORD: LAT.45.464 / LON.9.190</span>
            <span className="font-mono text-[10px] text-gold-muted">CRAFTED WITH PRECISION IN NYC, MILAN, TOKYO</span>
          </div>
        </div>
      )}
    </>
  );
}
