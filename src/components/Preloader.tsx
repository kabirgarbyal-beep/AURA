import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    // Progress counter animation
    const obj = { val: 0 };
    gsap.to(obj, {
      val: 100,
      duration: 3.2,
      ease: 'power3.out',
      onUpdate: () => {
        setProgress(Math.floor(obj.val));
      },
      onComplete: () => {
        // Smoothly exit once progress hits 100% and lines are drawn
        const tl = gsap.timeline({
          onComplete: onComplete
        });

        tl.to('.preloader-draw-item', {
          opacity: 0,
          y: -20,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.inOut',
        });

        tl.to(containerRef.current, {
          clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
          duration: 1.2,
          ease: 'power4.inOut',
        }, '-=0.4');
      }
    });

    // Animate the path drawing to match progress
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = `${length}`;
      pathRef.current.style.strokeDashoffset = `${length}`;

      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        duration: 2.8,
        ease: 'power2.out',
      });
    }
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-luxury-black blueprint-grid border-b border-gold-muted/10"
    >
      {/* Background ambient gold glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-text/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold-text/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Decorative Technical Crosshairs */}
      <div className="absolute top-8 left-8 text-[10px] font-mono text-gold-muted/30">L_01 // ARCHITECTURAL_INIT</div>
      <div className="absolute top-8 right-8 text-[10px] font-mono text-gold-muted/30">COORD_X_884.21 // Y_41.0</div>
      <div className="absolute bottom-8 left-8 text-[10px] font-mono text-gold-muted/30">REF.SYS.00 // AURA</div>
      <div className="absolute bottom-8 right-8 text-[10px] font-mono text-gold-muted/30">© 2026 AURA STUDIO</div>

      <div className="w-full max-w-2xl px-6 flex flex-col items-center">
        {/* Elegant Animated Blueprint Line Drawing of a Modern Villa elevation */}
        <div className="w-64 h-32 mb-10 preloader-draw-item opacity-100 flex items-center justify-center">
          <svg viewBox="0 0 200 100" className="w-full h-full stroke-gold-text fill-none stroke-[0.75] opacity-80">
            {/* Ground line */}
            <line x1="10" y1="90" x2="190" y2="90" />
            
            {/* House structure path */}
            <path
              ref={pathRef}
              d="M 30,90 L 30,50 L 80,50 L 80,30 L 140,30 L 140,50 L 170,50 L 170,90 Z"
            />
            
            {/* Architectural details */}
            <line x1="50" y1="90" x2="50" y2="60" className="opacity-40" />
            <line x1="60" y1="90" x2="60" y2="60" className="opacity-40" />
            <line x1="100" y1="90" x2="100" y2="40" className="opacity-50" />
            <line x1="120" y1="90" x2="120" y2="40" className="opacity-50" />
            <rect x="95" y="45" width="30" height="20" className="opacity-60" />
            
            {/* Fine elevation marking lines */}
            <line x1="20" y1="30" x2="80" y2="30" strokeDasharray="3,3" className="opacity-30" />
            <line x1="20" y1="50" x2="30" y2="50" strokeDasharray="3,3" className="opacity-30" />
            <line x1="170" y1="50" x2="180" y2="50" strokeDasharray="3,3" className="opacity-30" />
          </svg>
        </div>

        {/* Minimal Brand Label */}
        <div className="preloader-draw-item text-center mb-6">
          <h2 className="font-serif text-2xl tracking-[0.3em] text-f7f5f0 uppercase font-light">
            Aura Architecture
          </h2>
          <p className="text-[10px] tracking-[0.4em] font-mono text-gold-muted uppercase mt-2">
            Cinematic Architectural Documentary
          </p>
        </div>

        {/* Fine divider line */}
        <div className="w-full h-[1px] bg-gold-muted/10 relative overflow-hidden mb-6 preloader-draw-item">
          <div
            className="absolute left-0 top-0 h-full bg-gold-text transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Percentage Counter */}
        <div className="preloader-draw-item flex items-baseline justify-between w-full">
          <span className="text-[10px] font-mono text-gold-muted/50 tracking-wider">
            SYSTEM LOADER v1.2
          </span>
          <div ref={percentRef} className="font-mono text-4xl text-gold-text font-light tracking-widest">
            {progress < 10 ? `0${progress}` : progress}%
          </div>
        </div>
      </div>
    </div>
  );
}
