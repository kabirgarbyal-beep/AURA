import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { IMAGES } from '../assetsMapping';
import { Compass, Shield, Award, Users } from 'lucide-react';

export default function AboutView() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Custom states for counters
  const [estates, setEstates] = useState(0);
  const [awards, setAwards] = useState(0);
  const [partners, setPartners] = useState(0);

  useEffect(() => {
    // Staggered title and narrative animation
    gsap.fromTo('.about-title-char', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.08, ease: 'power4.out' }
    );

    gsap.fromTo('.about-narrative-item',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.5 }
    );

    // GSAP ScrollTrigger or simple timer counters
    const counterTimeline = gsap.timeline({ delay: 1.0 });
    counterTimeline.to({ val: 0 }, {
      val: 120,
      duration: 2.0,
      ease: 'power3.out',
      onUpdate: function() {
        setEstates(Math.floor(this.targets()[0].val));
      }
    });
    counterTimeline.to({ val: 0 }, {
      val: 18,
      duration: 1.5,
      ease: 'power3.out',
      onUpdate: function() {
        setAwards(Math.floor(this.targets()[0].val));
      }
    }, '-=1.8');
    counterTimeline.to({ val: 0 }, {
      val: 3,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: function() {
        setPartners(Math.floor(this.targets()[0].val));
      }
    }, '-=1.0');
  }, []);

  // Morphing slider drag event
  const handleSliderMove = (clientX: number) => {
    const sliderRect = sliderRef.current?.getBoundingClientRect();
    if (!sliderRect) return;
    const x = clientX - sliderRect.left;
    const percentage = Math.max(0, Math.min(100, (x / sliderRect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const timelineMilestones = [
    { year: '2018', title: 'Atelier Genesis', desc: 'Aura was founded in Milan as a bespoke lighting consultancy with three sketch pads and an old draft table.' },
    { year: '2020', title: 'Residential Breakthrough', desc: 'Commissioned to construct the famous Aether Villa, integrating raw concrete pillars with solar skylights.' },
    { year: '2023', title: 'Global Offices', desc: 'Expanded physical design studios to New York (Tribeca) and Tokyo (Minato-ku) for transnational luxury designs.' },
    { year: '2026', title: 'Cinematic Spatial Era', desc: 'Pioneering dynamic responsive architectural systems where light, noise-canceling glass, and marble morph seamlessly.' },
  ];

  const team = [
    { name: 'Elena Rostova', role: 'Founder & Principal Director', image: IMAGES.teamLead, quote: 'Space is silence. Design is the geometry we overlay to make that silence speak.' },
    { name: 'Kenji Takahashi', role: 'Lead Spatial Architect', image: IMAGES.teamArchitect, quote: 'Concrete behaves like liquid light when you frame it with deep volumetric shadows.' },
    { name: 'Marcus Sterling', role: 'Head Materials Alchemist', image: IMAGES.teamDesigner, quote: 'Every slab of gold-veined marble tells a geological history that we must respect.' }
  ];

  return (
    <div className="w-full bg-luxury-black text-f7f5f0 py-24 px-6 md:px-12 relative">
      {/* Blueprint Grid Overlay in page background */}
      <div className="absolute inset-0 blueprint-grid z-0 opacity-20 pointer-events-none" />

      {/* Decorative Technical Margins */}
      <div className="absolute top-24 left-12 text-[10px] font-mono text-gold-muted/40">SEC. STORY // ARCHITECTURAL STORYTELLING</div>
      <div className="absolute top-24 right-12 text-[10px] font-mono text-gold-muted/40">PAGE // 02_OF_07</div>

      {/* Narrative Section Header */}
      <div className="max-w-5xl mx-auto pt-12 relative z-10 mb-20">
        <span className="about-narrative-item font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-3 opacity-0">
          PHILOSOPHY & VISION
        </span>
        <h1 className="font-serif text-5xl md:text-7xl tracking-tight uppercase font-light leading-none mb-8">
          <span className="block overflow-hidden char-clip">
            <span className="inline-block about-title-char">Silent Luxury,</span>
          </span>
          <span className="block overflow-hidden char-clip text-gold-text">
            <span className="inline-block about-title-char">Bespoke Geometries</span>
          </span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          <p className="about-narrative-item text-f7f5f0/80 text-base md:text-lg leading-relaxed font-light opacity-0">
            We do not follow trends; we draft futures. By understanding how raw light interfaces with heavy materials—concrete, onyx, cedar, and hand-forged bronze—we compile architectural volumes that evoke emotional answers.
          </p>
          <p className="about-narrative-item text-f7f5f0/60 text-sm md:text-base leading-relaxed font-light opacity-0">
            Founded with a passion for architectural drafting and WebGL fluid interactions, our physical structures in Europe, Asia, and North America act as spatial instruments. We compose environments of supreme clarity.
          </p>
        </div>
      </div>

      {/* Interactive Blueprint-to-Render Morph Slider */}
      <div className="max-w-5xl mx-auto mb-28 relative z-10 about-narrative-item opacity-0">
        <p className="font-mono text-[9px] tracking-[0.3em] text-gold-muted uppercase mb-4 text-center">
          [ INTERACTIVE ] DRAG OR HOVER TO MORPH BLUEPRINT INTO COMPLETED SPA
        </p>
        <div 
          ref={sliderRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative w-full h-[300px] md:h-[500px] overflow-hidden border border-gold-text/10 select-none cursor-ew-resize group"
        >
          {/* Base Layer: Blueprint Drawing */}
          <div className="absolute inset-0 bg-luxury-gray flex items-center justify-center">
            <img 
              src={IMAGES.blueprintPaper} 
              alt="Architectural Blueprint Drawing" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-80"
            />
            {/* Blueprint Overlay Label */}
            <div className="absolute bottom-6 left-6 z-20 font-mono text-[10px] bg-luxury-black/80 px-3 py-1 text-gold-text border border-gold-text/20">
              ELEVATION // DRAFT_088
            </div>
          </div>

          {/* Top Layer: Completed Render (Clipped) */}
          <div 
            className="absolute inset-0"
            style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          >
            <img 
              src={IMAGES.heroVilla} 
              alt="Completed Luxury Render" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Render Overlay Label */}
            <div className="absolute bottom-6 right-6 z-20 font-mono text-[10px] bg-luxury-black/80 px-3 py-1 text-gold-text border border-gold-text/20">
              MATERIALIZATION // RENDER_3D
            </div>
          </div>

          {/* Split Handle line */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-gold-text z-30"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-luxury-black border border-gold-text flex items-center justify-center text-gold-text text-xs shadow-lg font-mono">
              ↔
            </div>
          </div>
        </div>
      </div>

      {/* Animated Statistics Panel */}
      <div className="max-w-5xl mx-auto mb-28 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div className="glass-panel border border-white/5 p-8 text-center relative overflow-hidden about-narrative-item opacity-0">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-text/40 to-transparent" />
          <Award className="w-6 h-6 text-gold-text mx-auto mb-4" />
          <h3 className="font-serif text-5xl text-gold-text font-light mb-2">{estates}+</h3>
          <p className="font-mono text-[10px] text-gold-muted uppercase tracking-widest">Estates Crafted</p>
        </div>
        <div className="glass-panel border border-white/5 p-8 text-center relative overflow-hidden about-narrative-item opacity-0">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-text/40 to-transparent" />
          <Compass className="w-6 h-6 text-gold-text mx-auto mb-4" />
          <h3 className="font-serif text-5xl text-gold-text font-light mb-2">{awards}</h3>
          <p className="font-mono text-[10px] text-gold-muted uppercase tracking-widest">Global Architecture Awards</p>
        </div>
        <div className="glass-panel border border-white/5 p-8 text-center relative overflow-hidden about-narrative-item opacity-0">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-text/40 to-transparent" />
          <Users className="w-6 h-6 text-gold-text mx-auto mb-4" />
          <h3 className="font-serif text-5xl text-gold-text font-light mb-2">{partners}</h3>
          <p className="font-mono text-[10px] text-gold-muted uppercase tracking-widest">Design Offices Globally</p>
        </div>
      </div>

      {/* Interactive 3D timeline */}
      <div className="max-w-5xl mx-auto mb-28 relative z-10">
        <span className="font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-8 text-center about-narrative-item opacity-0">
          CHRONICLED JOURNEY (2018 - 2026)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {timelineMilestones.map((milestone, idx) => (
            <div 
              key={milestone.year}
              style={{ animationDelay: `${idx * 0.15}s` }}
              className="glass-panel border border-white/5 p-6 hover:border-gold-text/30 transition-all duration-500 relative group about-narrative-item opacity-0"
            >
              {/* Timeline Year Indicator */}
              <div className="font-serif text-4xl text-gold-text/30 group-hover:text-gold-text transition-colors duration-500 font-light mb-4">
                {milestone.year}
              </div>
              <h4 className="font-sans text-sm font-semibold tracking-wide uppercase mb-2">
                {milestone.title}
              </h4>
              <p className="text-f7f5f0/60 text-xs leading-relaxed font-light">
                {milestone.desc}
              </p>
              {/* Connection visual line */}
              {idx < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[1px] bg-gold-text/10 group-hover:bg-gold-text/40 transition-colors duration-500 z-20" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3D-Tilt Team Members Cards Section */}
      <div className="max-w-5xl mx-auto relative z-10">
        <span className="font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-12 text-center about-narrative-item opacity-0">
          PRINCIPALS & ALCHEMISTS
        </span>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, idx) => (
            <div 
              key={member.name}
              style={{ animationDelay: `${idx * 0.2}s` }}
              className="glass-panel border border-white/5 rounded-none overflow-hidden group hover:border-gold-text/40 transition-all duration-500 about-narrative-item opacity-0"
            >
              {/* Visual Avatar container with parallax-zoom scale */}
              <div className="relative h-72 overflow-hidden bg-luxury-gray">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent" />
              </div>

              {/* Card Meta Content */}
              <div className="p-6">
                <h3 className="font-serif text-xl tracking-wide text-f7f5f0 mb-1">
                  {member.name}
                </h3>
                <span className="font-mono text-[9px] tracking-widest text-gold-text uppercase block mb-4">
                  {member.role}
                </span>
                <p className="text-f7f5f0/60 text-xs italic leading-relaxed font-light border-l border-gold-text/30 pl-4">
                  &ldquo;{member.quote}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
