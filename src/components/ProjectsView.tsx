import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { IMAGES } from '../assetsMapping';
import { ProjectItem } from '../types';
import { Sliders, Maximize2, X, Compass, Layers } from 'lucide-react';

const projectsData: ProjectItem[] = [
  {
    id: 'aether-villa',
    title: 'Aether Villa',
    category: 'Residential',
    location: 'Lake Como, Italy',
    year: '2023',
    description: 'A striking structural composition featuring cantilevered floor-to-ceiling glass systems, floating concrete frames, and gold-trimmed basalt walls overlooking the misty Lake Como.',
    imageBefore: IMAGES.blueprintPaper,
    imageAfter: IMAGES.heroVilla,
  },
  {
    id: 'brutalist-solitude',
    title: 'Brutalist Solitude',
    category: 'Conceptual',
    location: 'Engadin Valley, Switzerland',
    year: '2025',
    description: 'A subterranean sanctuary crafted inside raw volcanic rock, containing a pristine heated pool, monolithic concrete pillars, and precise linear skylights casting geometric shafts of light.',
    imageBefore: IMAGES.blueprintPaper,
    imageAfter: IMAGES.brutalistSolitude,
  },
  {
    id: 'onyx-penthouse',
    title: 'Onyx Penthouse',
    category: 'Hospitality',
    location: 'Tribeca, New York',
    year: '2024',
    description: 'A dark, brooding culinary landscape styled with premium gold-veined black marble, micro-textured cabinetry, warm amber lighting tubes, and continuous bronze horizontal profiles.',
    imageBefore: IMAGES.blueprintPaper,
    imageAfter: IMAGES.onyxPenthouse,
  },
  {
    id: 'marble-sanctuary',
    title: 'Marble Sanctuary',
    category: 'Residential',
    location: 'Kyoto, Japan',
    year: '2026',
    description: 'A minimalist bathing chamber built from pure monolithic white Carrara marble slabs, integrating hidden ceiling micro-emitters and glowing recessed gold niches.',
    imageBefore: IMAGES.blueprintPaper,
    imageAfter: IMAGES.marbleSanctuary,
  }
];

export default function ProjectsView() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Residential' | 'Hospitality' | 'Conceptual'>('All');
  const [activeComparisonId, setActiveComparisonId] = useState<string | null>(null);
  const [comparisonSliderPos, setComparisonSliderPos] = useState<number>(50);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fade in project galleries
    gsap.fromTo('.project-grid-item', 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: 'power3.out' }
    );
  }, [activeFilter]);

  // Card Mouse Parallax/Tilt Interaction
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-10 to 10 degrees)
    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = -((y / rect.height) - 0.5) * 12;

    gsap.to(card, {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      duration: 0.3,
      ease: 'power2.out'
    });

    // Subtly shift inside elements as layers
    const glassBadge = card.querySelector('.parallax-layer-badge');
    if (glassBadge) {
      gsap.to(glassBadge, {
        x: ((x / rect.width) - 0.5) * 15,
        y: ((y / rect.height) - 0.5) * 15,
        duration: 0.2,
      });
    }
  };

  const handleCardMouseLeave = (card: HTMLDivElement) => {
    gsap.to(card, {
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      duration: 0.5,
      ease: 'power3.out'
    });

    const glassBadge = card.querySelector('.parallax-layer-badge');
    if (glassBadge) {
      gsap.to(glassBadge, { x: 0, y: 0, duration: 0.3 });
    }
  };

  // Compare drag event
  const handleCompareMove = (clientX: number, rectWidth: number, rectLeft: number) => {
    const x = clientX - rectLeft;
    const percentage = Math.max(0, Math.min(100, (x / rectWidth) * 100));
    setComparisonSliderPos(percentage);
  };

  const filteredProjects = projectsData.filter(p => 
    activeFilter === 'All' ? true : p.category === activeFilter
  );

  return (
    <div ref={containerRef} className="w-full bg-luxury-black text-f7f5f0 py-24 px-6 md:px-12 relative min-h-screen">
      {/* Background blueprint grid overlay */}
      <div className="absolute inset-0 blueprint-grid z-0 opacity-20 pointer-events-none" />

      {/* Decorative Meta Grid lines */}
      <div className="absolute top-24 left-12 text-[10px] font-mono text-gold-muted/40">SEC. GALLERIES // CRAFTED ARCHITECTURES</div>
      <div className="absolute top-24 right-12 text-[10px] font-mono text-gold-muted/40">PAGE // 03_OF_07</div>

      {/* Gallery Header */}
      <div className="max-w-6xl mx-auto pt-12 relative z-10 mb-16 text-center">
        <span className="font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-3">
          CURATED CASE STUDIES
        </span>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight uppercase font-light leading-none mb-6">
          Architectural Gallery
        </h1>
        <p className="max-w-xl mx-auto text-f7f5f0/60 text-xs md:text-sm tracking-wide leading-relaxed font-light">
          Walk through our modern monument series. Each project introduces unique structural solutions, combining handcrafted masonry, raw casting, and custom fluid light panels.
        </p>

        {/* Dynamic Filter Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          {(['All', 'Residential', 'Hospitality', 'Conceptual'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-300 border hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text ${
                activeFilter === filter 
                  ? 'border-gold-text bg-gold-text text-luxury-black font-semibold' 
                  : 'border-white/10 text-f7f5f0/60 hover:text-f7f5f0 hover:border-f7f5f0/30 bg-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Projects Cards (with CSS 3D mouse hover parallax) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            onMouseMove={(e) => handleCardMouseMove(e, p.id)}
            onMouseLeave={(e) => handleCardMouseLeave(e.currentTarget)}
            className="project-grid-item project-card bg-luxury-gray border border-white/5 relative overflow-hidden transition-all duration-300 group select-none flex flex-col justify-between"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Project Image Layer (Hover expands/zooms) */}
            <div className="relative h-64 md:h-80 overflow-hidden bg-luxury-black pointer-events-none">
              <img
                src={p.imageAfter}
                alt={p.title}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-luxury-black/30 to-transparent" />

              {/* Floating glass category badge (3D Parallax Layer) */}
              <div 
                className="parallax-layer-badge absolute top-6 left-6 px-3 py-1 glass-panel border border-white/10 font-mono text-[9px] text-gold-text uppercase tracking-widest"
                style={{ transform: 'translateZ(30px)' }}
              >
                {p.category}
              </div>
            </div>

            {/* Project Specifications info */}
            <div className="p-6 relative z-10 bg-luxury-gray" style={{ transform: 'translateZ(15px)' }}>
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-gold-muted">
                <span>LOC: {p.location}</span>
                <span>EST: {p.year}</span>
              </div>
              
              <h3 className="font-serif text-2xl tracking-wide text-f7f5f0 uppercase mb-2 group-hover:text-gold-text transition-colors duration-300">
                {p.title}
              </h3>
              
              <p className="text-f7f5f0/60 text-xs font-light leading-relaxed mb-6 line-clamp-2">
                {p.description}
              </p>

              {/* Action Buttons inside Card */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <button
                  onClick={() => setSelectedProject(p)}
                  className="magnetic-btn text-[10px] font-mono text-gold-text uppercase tracking-widest flex items-center space-x-2 hover:text-f7f5f0 transition-colors duration-300 hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Interactive Specs</span>
                </button>

                <button
                  onClick={() => {
                    setActiveComparisonId(p.id);
                    setComparisonSliderPos(50);
                  }}
                  className="magnetic-btn text-[10px] font-mono text-f7f5f0/50 uppercase tracking-widest flex items-center space-x-2 hover:text-gold-text transition-colors duration-300 hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Blueprint Compare</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Immersive Fullscreen Specification Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-luxury-black/95 backdrop-blur-2xl overflow-y-auto">
          <div className="w-full max-w-4xl bg-luxury-gray border border-white/10 p-6 md:p-10 relative flex flex-col md:flex-row gap-8">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gold-text transition-colors duration-300 hover-target"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Page: Render details and specifications */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[9px] text-gold-text tracking-[0.3em] uppercase block mb-2">PROJECT DOSSIER</span>
                <h2 className="font-serif text-3xl md:text-4xl text-f7f5f0 uppercase mb-4">{selectedProject.title}</h2>
                <p className="text-f7f5f0/70 text-xs md:text-sm font-light leading-relaxed mb-6">{selectedProject.description}</p>
                
                {/* Tech Specs */}
                <div className="space-y-3 font-mono text-[11px] border-t border-white/10 pt-4">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gold-muted">LOCATION:</span>
                    <span>{selectedProject.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gold-muted">ESTABLISHED:</span>
                    <span>{selectedProject.year}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gold-muted">VOLUME AREA:</span>
                    <span>420 SQM // CAVITY CONCRETE</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gold-muted">CHIEF ARCHITECT:</span>
                    <span>ELENA ROSTOVA</span>
                  </div>
                </div>
              </div>

              {/* Interactive buttons */}
              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setActiveComparisonId(selectedProject.id);
                    setSelectedProject(null);
                  }}
                  className="px-6 py-3 bg-gold-text text-luxury-black font-semibold text-[10px] uppercase tracking-wider hover-target"
                >
                  Blueprint Compare
                </button>
                <div className="flex items-center space-x-2 font-mono text-[9px] text-gold-muted">
                  <Compass className="w-4 h-4 text-gold-text" />
                  <span>REF_SYSTEM // ACTIVE_COMPILING</span>
                </div>
              </div>
            </div>

            {/* Right Page: Full photo layout */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-luxury-black border border-white/5">
              <img
                src={selectedProject.imageAfter}
                alt={selectedProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Before/After Blueprint Comparison Overlay */}
      {activeComparisonId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-luxury-black/95 backdrop-blur-2xl">
          {(() => {
            const proj = projectsData.find(p => p.id === activeComparisonId);
            if (!proj) return null;
            return (
              <div className="w-full max-w-4xl bg-luxury-gray border border-white/10 p-6 relative flex flex-col">
                <button
                  onClick={() => setActiveComparisonId(null)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gold-text transition-colors duration-300 hover-target"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="mb-4">
                  <h3 className="font-serif text-2xl text-f7f5f0 uppercase tracking-wide">{proj.title}</h3>
                  <p className="font-mono text-[9px] text-gold-muted uppercase mt-1">
                    [ COMPILATION COMPARATOR ] Drag or move mouse horizontally within window to compare blueprint and final space
                  </p>
                </div>

                <div 
                  className="relative w-full h-[300px] md:h-[450px] overflow-hidden select-none cursor-ew-resize border border-gold-text/20 bg-luxury-black"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    handleCompareMove(e.clientX, rect.width, rect.left);
                  }}
                  onTouchMove={(e) => {
                    if (e.touches[0]) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleCompareMove(e.touches[0].clientX, rect.width, rect.left);
                    }
                  }}
                >
                  {/* Blueprint back layer */}
                  <div className="absolute inset-0 bg-luxury-black">
                    <img
                      src={proj.imageBefore}
                      alt="Blueprint drawing"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute top-4 left-4 z-20 font-mono text-[9px] bg-luxury-black/80 text-gold-text px-2 py-0.5 border border-gold-text/10">
                      BLUEPRINT DRAWING // CAD_09
                    </div>
                  </div>

                  {/* Render front clipped layer */}
                  <div 
                    className="absolute inset-0"
                    style={{ clipPath: `polygon(0 0, ${comparisonSliderPos}% 0, ${comparisonSliderPos}% 100%, 0 100%)` }}
                  >
                    <img
                      src={proj.imageAfter}
                      alt="Completed render"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 z-20 font-mono text-[9px] bg-luxury-black/80 text-gold-text px-2 py-0.5 border border-gold-text/10">
                      COMPLETED ATMOSPHERE // 8K_GL
                    </div>
                  </div>

                  {/* Divider slider line */}
                  <div 
                    className="absolute top-0 bottom-0 w-[1.5px] bg-gold-text z-30"
                    style={{ left: `${comparisonSliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-luxury-black border border-gold-text flex items-center justify-center text-gold-text text-xs">
                      ↔
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
