import React, { useEffect, useState, useRef } from 'react';
import { ArrowUp, Mail, Phone, MapPin, Instagram, Linkedin, Twitter, Shield, Clock, X } from 'lucide-react';
import { ActivePage, PAGE_TO_PATH } from '../types';
import gsap from 'gsap';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
}

export default function Footer({ setActivePage }: FooterProps) {
  const footerRef = useRef<HTMLDivElement>(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [timeMilan, setTimeMilan] = useState('');
  const [timeNYC, setTimeNYC] = useState('');
  const [timeTokyo, setTimeTokyo] = useState('');

  // Update dynamic local clocks for Milan, NYC, and Tokyo
  useEffect(() => {
    const updateClocks = () => {
      const getFormattedTime = (offset: number) => {
        const d = new Date();
        const utc = d.getTime() + d.getTimezoneOffset() * 60000;
        const nd = new Date(utc + 3600000 * offset);
        return nd.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      };

      // Milan (UTC+2 DST / UTC+1) - simple UTC+2
      setTimeMilan(getFormattedTime(2));
      // NYC (UTC-4 DST / UTC-5) - simple UTC-4
      setTimeNYC(getFormattedTime(-4));
      // Tokyo (UTC+9)
      setTimeTokyo(getFormattedTime(9));
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let observer: IntersectionObserver | null = null;

    if (!prefersReducedMotion) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Target line dividers, text groups, and links sequentially
              const tl = gsap.timeline();
              tl.fromTo(
                footer.querySelectorAll('.footer-line'),
                { scaleX: 0 },
                { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }
              );
              tl.fromTo(
                footer.querySelectorAll('.footer-reveal'),
                { opacity: 0, y: 40 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 1.0,
                  stagger: 0.08,
                  ease: 'power3.out',
                  overwrite: 'auto'
                },
                '-=0.8'
              );
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(footer);
    } else {
      // Direct presentation for accessibility / reduced motion
      gsap.set(footer.querySelectorAll('.footer-reveal'), { opacity: 1, y: 0 });
      gsap.set(footer.querySelectorAll('.footer-line'), { scaleX: 1 });
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleNavClick = (pageId: ActivePage) => {
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
      const tl = gsap.timeline();
      tl.to(overlay, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.5,
        ease: 'power3.in',
      });
      tl.add(() => {
        setActivePage(pageId);
        const urlPath = pageId === 'home' ? '/' : `/${PAGE_TO_PATH[pageId]}`;
        window.history.pushState(null, '', urlPath);
        window.scrollTo(0, 0);
      });
      tl.to(overlay, {
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        duration: 0.6,
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
    <footer 
      ref={footerRef}
      className="relative w-full bg-[#080808] pt-28 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden z-20 border-t border-white/5"
      id="main-app-footer"
      aria-label="Atelier Premium Footer"
    >
      {/* Subtle Blueprint Grid Overlay */}
      <div className="absolute inset-0 blueprint-grid opacity-[0.08] pointer-events-none" />

      {/* Thin elegant horizontal line on top with transition */}
      <div className="footer-line w-full h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent absolute top-0 left-0 origin-center scale-x-0" />

      <div className="max-w-7xl mx-auto">
        
        {/* TOP SCENE: Giant Brand Calligraphy & Quick Zenith return */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20 relative z-10">
          <div className="footer-reveal opacity-0">
            <span className="font-mono text-[9px] text-gold-text tracking-[0.4em] uppercase block mb-3">
              FINALE // THE COGNIZANCE OF SPACE
            </span>
            <h2 className="font-serif text-5xl md:text-7xl font-extralight tracking-tight uppercase leading-none text-[#f7f5f0]">
              Aura<span className="text-gold-text font-normal">.</span>
            </h2>
          </div>

          <div className="footer-reveal opacity-0 w-full md:w-auto">
            <button
              onClick={scrollToTop}
              className="group hover-target flex items-center justify-between space-x-6 border border-white/10 hover:border-gold-text bg-luxury-gray/10 backdrop-blur-md px-6 py-4 text-[10px] font-mono uppercase tracking-[0.25em] text-f7f5f0/70 hover:text-gold-text transition-all duration-500 rounded-none w-full md:w-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text"
              id="btn-back-to-top"
              aria-label="Return back to top zenith of page"
            >
              <span>Return to Zenith</span>
              <div className="w-8 h-8 rounded-full border border-white/10 group-hover:border-gold-text/50 flex items-center justify-center transition-all duration-300">
                <ArrowUp className="w-3.5 h-3.5 transform group-hover:-translate-y-1 transition-transform duration-500 ease-out" />
              </div>
            </button>
          </div>
        </div>

        {/* MIDDLE SCENE: Editorial Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-10 pb-16 relative z-10 border-b border-white/5">
          
          {/* Col 1: Philosphy & Identity */}
          <div className="space-y-6 lg:col-span-2 footer-reveal opacity-0">
            <h4 className="font-mono text-[10px] text-gold-text tracking-[0.35em] uppercase font-semibold">
              The Philosophy
            </h4>
            <p className="text-sm md:text-base text-f7f5f0/80 font-serif font-light italic leading-relaxed max-w-sm">
              “Light is not merely the absence of shadow, but the catalyst that transforms static space into a living, breathing emotional ecosystem.”
            </p>
            <p className="text-xs text-f7f5f0/50 font-light leading-relaxed max-w-sm">
              Our Milanesi laboratory designs custom residential coordinates and volumetric light vectors, materializing modern concrete, stone, and bronze into physical poetry.
            </p>
            
            {/* Social media connections */}
            <div className="pt-2 flex items-center space-x-5">
              <span className="font-mono text-[9px] text-gold-muted/50 uppercase tracking-widest">Connect:</span>
              <div className="flex space-x-3">
                {[
                  { icon: <Instagram className="w-3.5 h-3.5" />, href: 'https://instagram.com', label: 'Instagram' },
                  { icon: <Linkedin className="w-3.5 h-3.5" />, href: 'https://linkedin.com', label: 'LinkedIn' },
                  { icon: <Twitter className="w-3.5 h-3.5" />, href: 'https://twitter.com', label: 'Twitter' },
                ].map((social) => (
                  <a 
                    key={social.label}
                    href={social.href}
                    target="_blank" 
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full border border-white/5 hover:border-gold-text/30 flex items-center justify-center text-f7f5f0/40 hover:text-gold-text transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text hover-target"
                    aria-label={`Follow Aura on ${social.label}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Directory Directory */}
          <div className="space-y-5 footer-reveal opacity-0">
            <h4 className="font-mono text-[10px] text-gold-text tracking-[0.35em] uppercase font-semibold">
              Directory
            </h4>
            <ul className="space-y-3 text-xs font-light">
              {[
                { label: 'Architectural Story', page: 'about' },
                { label: 'Exhibition Gallery', page: 'projects' },
                { label: 'Atelier Islands', page: 'services' },
                { label: 'Creation Blueprint', page: 'process' },
                { label: 'Editorial Journal', page: 'blog' },
                { label: 'Inquire Commission', page: 'contact' },
                { label: 'Dossier Archives', page: 'archives' },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => handleNavClick(link.page as ActivePage)}
                    className="hover-target text-f7f5f0/60 hover:text-gold-text transition-colors duration-300 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text premium-underline inline-block pb-0.5"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Expertise (Services & Projects) */}
          <div className="space-y-5 footer-reveal opacity-0">
            <h4 className="font-mono text-[10px] text-gold-text tracking-[0.35em] uppercase font-semibold">
              Selected Works
            </h4>
            <ul className="space-y-3 text-xs font-light">
              {[
                { label: 'Spatial Architecture', page: 'services' },
                { label: 'Bespoke Interiors', page: 'services' },
                { label: 'Lighting Engineering', page: 'services' },
                { label: 'Volumetric Acoustics', page: 'services' },
                { label: 'Aether Villa Estate', page: 'projects' },
                { label: 'Brutalist Solitude Pool', page: 'projects' },
              ].map((item, idx) => (
                <li key={idx}>
                  <button
                    onClick={() => handleNavClick(item.page as ActivePage)}
                    className="hover-target text-f7f5f0/60 hover:text-gold-text transition-colors duration-300 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text premium-underline inline-block pb-0.5"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Immersive Hub Coordinates & Clocks (Glassmorphism card) */}
          <div className="space-y-6 footer-reveal opacity-0">
            <h4 className="font-mono text-[10px] text-gold-text tracking-[0.35em] uppercase font-semibold">
              Global Hubs
            </h4>
            
            <div className="glass-panel border border-white/5 p-5 space-y-4 relative">
              <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-gold-text/50 to-transparent" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-medium text-f7f5f0 block">MILANO // HEADQUARTERS</span>
                    <span className="text-[10px] font-mono text-f7f5f0/40 block">Via della Moscova 12</span>
                  </div>
                  <span className="text-[10px] font-mono text-gold-text flex items-center space-x-1.5 shrink-0 bg-[#121212] px-2 py-0.5 border border-white/5">
                    <Clock className="w-3 h-3 text-gold-text shrink-0" />
                    <span>{timeMilan || '00:00:00'}</span>
                  </span>
                </div>

                <div className="flex justify-between items-start border-t border-white/5 pt-2.5">
                  <div>
                    <span className="text-[11px] font-medium text-f7f5f0 block">NEW YORK // TRIBECA</span>
                    <span className="text-[10px] font-mono text-f7f5f0/40 block">124 Hudson St, NY</span>
                  </div>
                  <span className="text-[10px] font-mono text-gold-text flex items-center space-x-1.5 shrink-0 bg-[#121212] px-2 py-0.5 border border-white/5">
                    <Clock className="w-3 h-3 text-gold-text shrink-0" />
                    <span>{timeNYC || '00:00:00'}</span>
                  </span>
                </div>

                <div className="flex justify-between items-start border-t border-white/5 pt-2.5">
                  <div>
                    <span className="text-[11px] font-medium text-f7f5f0 block">TOKYO // MINAMI-AOYAMA</span>
                    <span className="text-[10px] font-mono text-f7f5f0/40 block">2-16-1 Minato-ku</span>
                  </div>
                  <span className="text-[10px] font-mono text-gold-text flex items-center space-x-1.5 shrink-0 bg-[#121212] px-2 py-0.5 border border-white/5">
                    <Clock className="w-3 h-3 text-gold-text shrink-0" />
                    <span>{timeTokyo || '00:00:00'}</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex flex-col space-y-1 text-[10px] font-mono text-gold-muted">
                <span className="flex items-center space-x-1.5">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span>+39 02 8847 11</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <Mail className="w-3 h-3 shrink-0" />
                  <a href="mailto:milano@aurastudio.com" className="hover:text-f7f5f0 transition-colors duration-300">
                    milano@aurastudio.com
                  </a>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SCENE: Rights, Legal & System coordinates */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-gold-muted/50 tracking-wider relative z-10 footer-reveal opacity-0 gap-6">
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            <span>© 2026 AURA ATELIER. ALL RIGHTS RESERVED.</span>
            <span className="text-white/10 hidden sm:inline">|</span>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-gold-text text-gold-muted/60 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text flex items-center space-x-1.5 hover-target"
              id="btn-footer-privacy"
              aria-label="View Privacy Guidelines"
            >
              <Shield className="w-3 h-3 text-gold-text/50" />
              <span>CONFIDENTIALITY PROTOCOL</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-center md:text-right justify-center items-center">
            <span>MILANO // NYC // TOKYO</span>
            <span className="text-white/15">•</span>
            <button
              onClick={() => handleNavClick('archives')}
              className="hover:text-gold-text text-gold-muted/50 transition-colors duration-300 focus:outline-none hover-target cursor-pointer text-[10px] uppercase font-mono"
            >
              SYS.VER // 3.2.1 // SECURE // ARCHIVAL_FEED
            </button>
          </div>
        </div>

      </div>

      {/* LUXURY SLIDE-UP PRIVACY PROTOCOL DRAWER / DIALOG (No mock links, 100% functional) */}
      {isPrivacyOpen && (
        <div 
          className="fixed inset-0 bg-luxury-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-6 transition-all duration-500"
          role="dialog"
          aria-modal="true"
          id="privacy-protocol-overlay"
        >
          <div className="glass-panel border border-white/10 max-w-2xl w-full p-8 md:p-10 relative overflow-hidden flex flex-col max-h-[85vh]">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-gold-text to-transparent" />
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/5">
              <div>
                <span className="font-mono text-[9px] text-gold-text tracking-[0.3em] uppercase block mb-1">
                  AURA ATELIER SECURITY COGNIZANCE
                </span>
                <h3 className="font-serif text-2xl text-f7f5f0 uppercase tracking-wide">
                  Confidentiality Protocol
                </h3>
              </div>
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="w-10 h-10 rounded-full border border-white/10 hover:border-gold-text flex items-center justify-center text-f7f5f0/60 hover:text-gold-text transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text hover-target"
                aria-label="Close Protocol"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="flex-grow overflow-y-auto space-y-6 text-xs md:text-sm font-light text-f7f5f0/70 leading-relaxed pr-2 scrollbar-thin">
              <p className="font-mono text-[10px] text-gold-muted">
                EFFECTIVE METRIC: 2026.06.29 // EDITION VERSION_3.2.0
              </p>

              <div>
                <h4 className="font-serif text-base text-f7f5f0 uppercase mb-2">1. Architectural Dossier Security</h4>
                <p>
                  Any design commission, site survey, architectural blueprint, or geographical coordinate transmitted to the Aura Atelier through our secure transmit channels is encrypted via private SSL handshakes. We hold all client identities, physical assets locations, and luxury blueprints under deep digital lock, inaccessible to the public domain.
                </p>
              </div>

              <div>
                <h4 className="font-serif text-base text-f7f5f0 uppercase mb-2">2. Geolocation & Site Data</h4>
                <p>
                  We catalog land coordinates, local diurnal map datasets, and materials matrices strictly for computational rendering and shadows mapping within the Three.js viewport. No telemetry or physical location details are distributed, shared, or compiled for marketing.
                </p>
              </div>

              <div>
                <h4 className="font-serif text-base text-f7f5f0 uppercase mb-2">3. Cryptographic Cookie Protocols</h4>
                <p>
                  Our system utilizes local browser storage solely to preserve visual layout states (e.g., remembering your last accessed project filters, or preventing rendering pipeline hiccups when exploring between architectural islands). We never execute third-party advertising cookies or cross-site tracking engines.
                </p>
              </div>

              <div className="border-t border-white/5 pt-4 text-[10px] font-mono text-gold-muted/60">
                AUTHORIZED BY THE BOARD OF DIRECTORS // MILAN, ITALY.
              </div>
            </div>

            {/* Footer buttons */}
            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setIsPrivacyOpen(false)}
                className="px-6 py-3 bg-gold-text text-luxury-black font-mono text-[10px] uppercase tracking-widest hover-target hover:bg-f7f5f0 transition-all duration-300"
              >
                Acknowledge Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
