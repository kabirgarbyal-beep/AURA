import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { IMAGES } from '../assetsMapping';
import { BlogPost } from '../types';
import { BookOpen, Calendar, ArrowUpRight, X } from 'lucide-react';

const blogPosts: BlogPost[] = [
  {
    id: 'diurnal-lighting-study',
    title: 'Modulating Diurnal Light: How Sunlight Shapes Luxury Volumes',
    category: 'Lighting Theory',
    date: 'June 18, 2026',
    readTime: '08 Min',
    excerpt: 'An investigative exploration into carving custom concrete vaults to route the sun-vectors elegantly throughout the summer solstice.',
    content: `When we construct architectural volumes, we are fundamentally building shadow receptors. Sunlight is a dynamic, fluid fluid that changes its warmth, incident angle, and intensity over 24-hour cycles. By integrating double-glazed high-efficiency windows with precise concrete overhang calculations, we can route warm beams of sunlight exactly where they are needed at any hour. This editorial outlines our methodology for spatial light routing in northern Italy.`,
    image: IMAGES.heroVilla
  },
  {
    id: 'brutalist-concrete-pool',
    title: 'Raw Solitude: Constructing Underwater Columns in Volcanic Rock',
    category: 'Material Alchemy',
    date: 'May 24, 2026',
    readTime: '12 Min',
    excerpt: 'Detailed review of structural execution inside subterranean Switzerland, detailing high-pressure raw concrete curing techniques.',
    content: `Underground pool construction presents severe thermal and moisture challenges. In the Brutalist Solitude estate, we carved high-altitude volcanic rock cavities to anchor thick raw concrete columns. These columns support a monumental floating concrete ceiling, pierced by structural skylights. We detail the curing methods required to achieve smooth velvet-like concrete textures.`,
    image: IMAGES.brutalistSolitude
  },
  {
    id: 'onyx-marble-reveals',
    title: 'The Fine Gap: Why Material Reveals Define Modern Craft',
    category: 'Detailing',
    date: 'April 09, 2026',
    readTime: '05 Min',
    excerpt: 'Exploring the 3mm structural gaps between marble slabs and brushed brass, honoring the borders of spatial elements.',
    content: `In high-end luxury interiors, luxury is defined by the transitions. When a sheet of solid black gold-veined marble sits directly flush against brushed basalt or oil-finished cedar, expansion forces and visual crowding destroy the design's purity. By introducing a deliberate, engineered 3mm recessed gap—the "reveal line"—we honor the unique borders of each material element.`,
    image: IMAGES.onyxPenthouse
  }
];

export default function BlogView() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    // Elegant slide up for editorial magazine posts
    gsap.fromTo('.editorial-card',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power4.out' }
    );
  }, []);

  return (
    <div className="w-full bg-luxury-black text-f7f5f0 py-24 px-6 md:px-12 relative min-h-screen">
      {/* Blueprint Grid Overlay in background */}
      <div className="absolute inset-0 blueprint-grid z-0 opacity-15 pointer-events-none" />

      {/* Decorative Technical Margins */}
      <div className="absolute top-24 left-12 text-[10px] font-mono text-gold-muted/40">SEC. EDITORIAL // ARCHITECTURAL DIALOGUES</div>
      <div className="absolute top-24 right-12 text-[10px] font-mono text-gold-muted/40">PAGE // 06_OF_07</div>

      {/* Editorial Header */}
      <div className="max-w-5xl mx-auto pt-12 relative z-10 mb-20">
        <span className="font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-3">
          AURA CHRONICLES
        </span>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight uppercase font-light leading-none mb-6">
          The Editorial Magazine
        </h1>
        <p className="max-w-2xl text-f7f5f0/60 text-xs md:text-sm tracking-wide leading-relaxed font-light">
          We draft regular theory documents analyzing stone procurement, sun geometries, structural acoustics, and material joints. Explore our research logs.
        </p>
      </div>

      {/* Alternating Magazine Columns Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10 items-start">
        {blogPosts.map((post, idx) => {
          const isLarge = idx === 0;
          return (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`editorial-card cursor-pointer group bg-luxury-gray/40 border border-white/5 hover:border-gold-text/30 transition-all duration-500 overflow-hidden flex flex-col justify-between ${
                isLarge ? 'md:col-span-12 lg:col-span-8 h-full' : 'md:col-span-6 lg:col-span-4 h-full'
              }`}
            >
              {/* Image Banner */}
              <div className="relative h-64 overflow-hidden bg-luxury-black">
                <img
                  src={post.image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-transparent to-transparent" />
                
                {/* Floating category */}
                <span className="absolute top-4 left-4 px-3 py-1 glass-panel border border-white/15 text-[9px] font-mono text-gold-text uppercase tracking-widest">
                  {post.category}
                </span>
              </div>

              {/* Text Area */}
              <div className="p-6 md:p-8 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-4 mb-4 text-[10px] font-mono text-gold-muted">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-gold-text" />
                      <span>{post.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 text-gold-text" />
                      <span>{post.readTime}</span>
                    </span>
                  </div>

                  <h3 className={`font-serif tracking-wide text-f7f5f0 uppercase mb-4 group-hover:text-gold-text transition-colors duration-300 ${
                    isLarge ? 'text-2xl md:text-3xl leading-snug' : 'text-lg leading-relaxed'
                  }`}>
                    {post.title}
                  </h3>

                  <p className="text-f7f5f0/60 text-xs md:text-sm font-light leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                </div>

                {/* Read Trigger button */}
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-mono text-[9px] text-gold-text tracking-widest uppercase">
                    READ DIALOGUE
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gold-muted group-hover:text-gold-text transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Expansive Fullscreen Article Overlay */}
      {selectedPost && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-luxury-black/95 backdrop-blur-2xl overflow-y-auto">
          <div className="w-full max-w-3xl bg-luxury-gray border border-white/15 p-6 md:p-10 relative">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gold-text transition-colors duration-300 hover-target"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Reading details */}
            <div className="max-w-2xl mx-auto">
              <span className="font-mono text-[10px] text-gold-text tracking-[0.3em] uppercase block mb-2">
                AURA RESEARCH LABS // {selectedPost.category.toUpperCase()}
              </span>

              <h2 className="font-serif text-3xl md:text-4xl text-f7f5f0 uppercase leading-snug mb-4">
                {selectedPost.title}
              </h2>

              <div className="flex items-center space-x-6 mb-8 text-[11px] font-mono text-gold-muted border-b border-white/10 pb-4">
                <span>DATE: {selectedPost.date}</span>
                <span>DURATION: {selectedPost.readTime}</span>
                <span>STATUS: OPEN_ARCHIVE</span>
              </div>

              {/* Large responsive article image */}
              <div className="h-64 md:h-80 w-full bg-luxury-black border border-white/5 mb-8">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Solid Rich Content Text */}
              <div className="text-f7f5f0/80 font-serif text-base leading-relaxed space-y-6 select-text mb-8">
                <p>{selectedPost.content}</p>
                <p>When executing projects like the Onyx Penthouse or Brutalist Solitude, the engineering requirements must strictly align with material coefficients. We carry out structural load checks alongside localized solar simulations, preventing early material fatigue or thermal cracking.</p>
                <p className="border-l border-gold-text pl-6 italic text-gold-text/80 text-sm">
                  &ldquo;A building achieves luxury when every single element—down to a recessed joint screw or an audio-absorption core panel—has been curated as part of a single artistic composition.&rdquo;
                </p>
                <p>We invite you to continue reading our published case books and exploring our interactive 3D structures on the other pages to understand our design philosophy.</p>
              </div>

              {/* Close Footer bar */}
              <div className="border-t border-white/5 pt-4 text-center">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-6 py-3 bg-gold-text text-luxury-black font-semibold text-[10px] uppercase tracking-wider hover-target"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
