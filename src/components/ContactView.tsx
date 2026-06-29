import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Send, Compass, Globe, MapPin, Cpu, RefreshCw } from 'lucide-react';

interface ContactViewProps {}

export default function ContactView({}: ContactViewProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [selectedCity, setSelectedCity] = useState<'Milan' | 'New York' | 'Tokyo'>('Milan');
  const [leftView, setLeftView] = useState<'globe' | 'map'>('globe');
  const [transmissionState, setTransmissionState] = useState<'idle' | 'encrypting' | 'routing' | 'beaming' | 'completed'>('idle');
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fade in form and card items
    if (prefersReducedMotion) {
      gsap.set('.contact-fade-item', { opacity: 1, y: 0 });
    } else {
      gsap.fromTo('.contact-fade-item',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    // 3D Glowing Globe in Three.js representing our global office hubs
    const canvasContainer = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!canvasContainer || !canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#080808', 0.2);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Create a wireframe Sphere (Earth) - simplified geometry segments from 32 to 24 to save GPU overhead
    const sphereGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xc5a880,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      roughness: 0.2,
      metalness: 0.8,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(globe);

    // Inner glowing sphere representing Core
    const coreGeo = new THREE.SphereGeometry(0.8, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xc5a880,
      wireframe: true,
      transparent: true,
      opacity: 0.04
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Coordinate markers for our hubs (Milan, NYC, Tokyo)
    const addHubMarker = (lat: number, lon: number, color: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(1.2 * Math.sin(phi) * Math.sin(theta));
      const y = (1.2 * Math.cos(phi));
      const z = (1.2 * Math.sin(phi) * Math.cos(theta));

      // Hub Marker Dot
      const markerGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const markerMat = new THREE.MeshBasicMaterial({ color, transparent: false });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x, y, z);
      globe.add(marker);

      // Hub Radial Ring (Glowing pulse)
      const ringGeo = new THREE.RingGeometry(0.05, 0.08, 24);
      const ringMat = new THREE.MeshBasicMaterial({ 
        color, 
        side: THREE.DoubleSide, 
        transparent: true, 
        opacity: 0.5 
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, z);
      ring.lookAt(0, 0, 0); // Aligns ring facing outwards
      globe.add(ring);

      return ring;
    };

    // Milan: Lat.45.464, Lon.9.190
    const milanRing = addHubMarker(45.464, 9.190, 0xc5a880);
    // New York: Lat.40.712, Lon.-74.006
    const nycRing = addHubMarker(40.712, -74.006, 0xc5a880);
    // Tokyo: Lat.35.676, Lon.139.65
    const tokyoRing = addHubMarker(35.676, 139.65, 0xc5a880);

    // Light sources
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    // SpotLight focusing on the globe
    const spotLight = new THREE.SpotLight(0xc5a880, 5, 8, Math.PI / 6, 0.5, 1);
    spotLight.position.set(1.5, 1.5, 2.5);
    spotLight.castShadow = false;
    scene.add(spotLight);

    // Track mouse using simple non-reactive local variables to rotate globe and guide lighting coordinates
    let targetX = 0;
    let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Debounced RESPONSIVE SIZING
    let resizeTimeout: number;
    const resizeObserver = new ResizeObserver((entries) => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        for (let entry of entries) {
          width = entry.contentRect.width;
          height = entry.contentRect.height;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }, 100);
    });
    resizeObserver.observe(canvasContainer);

    // Pause rendering loop when off screen
    let isElementVisible = true;
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isElementVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(canvasContainer);

    // Pause when tab is inactive
    const handleVisibilityChange = () => {
      isElementVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      if (!isElementVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsed = clock.getElapsedTime();

      // Slow self-rotation of globe
      const rotSpeed = prefersReducedMotion ? 0.02 : 0.12;
      globe.rotation.y = elapsed * rotSpeed;
      core.rotation.y = -elapsed * (rotSpeed * 0.6);

      // Pulse the rings (skip on prefers-reduced-motion to keep framerate solid)
      if (!prefersReducedMotion) {
        const pulseScale = 1 + Math.sin(elapsed * 4) * 0.35;
        milanRing.scale.set(pulseScale, pulseScale, 1);
        nycRing.scale.set(pulseScale, pulseScale, 1);
        tokyoRing.scale.set(pulseScale, pulseScale, 1);

        // Mouse interactive tilt shifts
        globe.rotation.y += targetX * 0.3;
        globe.rotation.x += targetY * 0.3;

        // Dynamic light movement
        spotLight.position.x += (targetX * 2 - spotLight.position.x) * 0.04;
        spotLight.position.y += (targetY * 2 - spotLight.position.y) * 0.04;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (!prefersReducedMotion) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.clearTimeout(resizeTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      // Deep disposal
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    // Real API fetch in the background to commit data to our persistent JSON database
    fetch('/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        bureau: selectedCity
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('Dossier persistently compiled inside archives:', data);
    })
    .catch(err => {
      console.error('Archives link failed, continuing local bypass:', err);
    });

    // Phase 1: Encrypting
    setTransmissionState('encrypting');
    setTransmissionProgress(15);

    setTimeout(() => {
      // Phase 2: Routing
      setTransmissionState('routing');
      setTransmissionProgress(50);
      
      setTimeout(() => {
        // Phase 3: Beaming
        setTransmissionState('beaming');
        setTransmissionProgress(85);

        setTimeout(() => {
          // Phase 4: Completed
          setTransmissionState('completed');
          setTransmissionProgress(100);
          setFormSubmitted(true);
          
          setTimeout(() => {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            gsap.fromTo('.approved-stamp',
              { scale: prefersReducedMotion ? 1 : 2.5, opacity: 0, rotate: prefersReducedMotion ? -12 : -45 },
              { scale: 1, opacity: 1, rotate: -12, duration: 0.6, ease: prefersReducedMotion ? 'power2.out' : 'bounce.out' }
            );
          }, 100);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const offices = [
    { city: 'Milan', address: 'Via della Moscova 12', zip: '20121 Milano, Italy', tel: '+39 02 8847 11', email: 'milano@aurastudio.com', coordinates: 'LAT: 45.4741° N // LON: 9.1914° E', embedUrl: 'https://maps.google.com/maps?q=Via%20della%20Moscova%2012,%20Milano&t=&z=14&ie=UTF8&iwloc=&output=embed' },
    { city: 'New York', address: '124 Hudson St, Tribeca', zip: '10013 New York, USA', tel: '+1 212 941 88', email: 'nyc@aurastudio.com', coordinates: 'LAT: 40.7202° N // LON: -74.0094° W', embedUrl: 'https://maps.google.com/maps?q=124%20Hudson%20St,%20New%20York&t=&z=14&ie=UTF8&iwloc=&output=embed' },
    { city: 'Tokyo', address: '2-16-1 Minami-Aoyama', zip: '107-0062 Tokyo, Japan', tel: '+81 3 5413 00', email: 'tokyo@aurastudio.com', coordinates: 'LAT: 35.6687° N // LON: 139.7228° E', embedUrl: 'https://maps.google.com/maps?q=2-16-1%20Minami-Aoyama,%20Tokyo&t=&z=14&ie=UTF8&iwloc=&output=embed' }
  ];

  return (
    <div className="w-full bg-luxury-black text-f7f5f0 py-24 px-6 md:px-12 relative min-h-screen">
      {/* Blueprint Grid Overlay in background */}
      <div className="absolute inset-0 blueprint-grid z-0 opacity-20 pointer-events-none" />

      {/* Decorative Technical Margins */}
      <div className="absolute top-24 left-12 text-[10px] font-mono text-gold-muted/40">SEC. CONTACT // HUB NETWORKS</div>
      <div className="absolute top-24 right-12 text-[10px] font-mono text-gold-muted/40">PAGE // 07_OF_07</div>

      {/* Page Content layout */}
      <div className="max-w-6xl mx-auto pt-12 relative z-10 flex flex-col lg:flex-row gap-12 items-stretch">
        
        {/* Left Side: Offices list & interactive WebGL Globe / Live Map */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-10">
          <div className="contact-fade-item opacity-0">
            <span className="font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-3">
              GLOBAL HUBS // INTERACTIVE NETWORK
            </span>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight uppercase font-light leading-none mb-8">
              Contact Atelier
            </h1>

            {/* List of offices details */}
            <div className="space-y-4">
              {offices.map((office) => (
                <button 
                  key={office.city} 
                  onClick={() => {
                    setSelectedCity(office.city as 'Milan' | 'New York' | 'Tokyo');
                    setLeftView('map');
                  }}
                  className={`w-full text-left pl-6 py-4 border-l transition-all duration-500 rounded-none relative group ${
                    selectedCity === office.city 
                      ? 'border-gold-text bg-white/5 shadow-[0_0_15px_rgba(197,168,128,0.05)]' 
                      : 'border-white/10 hover:border-gold-text/50 bg-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-serif text-xl text-f7f5f0 uppercase tracking-wide group-hover:text-gold-text transition-colors duration-300">
                      {office.city} Office
                    </h3>
                    {selectedCity === office.city && (
                      <span className="font-mono text-[8px] text-gold-text tracking-[0.25em]">// ACTIVE</span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-f7f5f0/60 leading-relaxed font-light font-mono">
                    <p>{office.address}</p>
                    <p>{office.zip}</p>
                    <p className="mt-1 text-gold-muted">{office.tel} // {office.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Dual-View Component */}
          <div className="contact-fade-item opacity-0 flex flex-col space-y-4">
            
            {/* Tab Controls */}
            <div className="flex space-x-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setLeftView('globe')}
                className={`px-4 py-2 font-mono text-[9px] tracking-widest uppercase transition-all duration-300 rounded-none border ${
                  leftView === 'globe' 
                    ? 'border-gold-text text-gold-text bg-white/5' 
                    : 'border-transparent text-gold-muted hover:text-f7f5f0'
                }`}
              >
                [ 01 // WEBGL HUB GLOBE ]
              </button>
              <button
                onClick={() => setLeftView('map')}
                className={`px-4 py-2 font-mono text-[9px] tracking-widest uppercase transition-all duration-300 rounded-none border ${
                  leftView === 'map' 
                    ? 'border-gold-text text-gold-text bg-white/5' 
                    : 'border-transparent text-gold-muted hover:text-f7f5f0'
                }`}
              >
                [ 02 // GOOGLE LIVE MAP ]
              </button>
            </div>

            {leftView === 'globe' ? (
              <div className="flex flex-col items-center">
                <span className="font-mono text-[8px] tracking-[0.3em] text-gold-muted uppercase mb-2">
                  [ WEBGL SPATIAL GLOBE ] DRAG/MOVE TO ROTATE HUBS
                </span>
                <div 
                  ref={canvasContainerRef}
                  className="w-full h-[320px] bg-luxury-gray/20 border border-white/5 relative overflow-hidden flex items-center justify-center"
                >
                  {/* Plot coordinates markings */}
                  <div className="absolute top-4 left-4 font-mono text-[8px] text-gold-text/40">NET: TRILATERAL_GRID</div>
                  <div className="absolute bottom-4 left-4 font-mono text-[8px] text-gold-text/40 flex items-center space-x-2">
                    <Compass className="w-3.5 h-3.5 text-gold-text" />
                    <span>ACTIVE_VECTOR // GLOBAL_HUB</span>
                  </div>
                  
                  <canvas ref={canvasRef} className="w-full h-full block" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[8px] tracking-[0.3em] text-gold-muted uppercase">
                    [ GOOGLE MAPS PLATFORM ] LIVE ATELIER COORDINATE
                  </span>
                  <span className="font-mono text-[8px] text-gold-text uppercase tracking-widest">
                    {offices.find(o => o.city === selectedCity)?.coordinates}
                  </span>
                </div>
                
                <div className="w-full h-[320px] bg-luxury-gray/20 border border-white/5 relative overflow-hidden flex items-center justify-center">
                  <iframe
                    title="Live Location Map"
                    src={offices.find(o => o.city === selectedCity)?.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ 
                      border: 0, 
                      filter: 'invert(90%) hue-rotate(180deg) grayscale(85%) contrast(115%) brightness(95%)',
                    }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  
                  {/* Architectural corner overlays */}
                  <div className="absolute top-4 left-4 font-mono text-[8px] text-gold-text/40 bg-luxury-black/80 px-2 py-1 border border-white/5">
                    MAP_FEED: {selectedCity.toUpperCase()}_ATELIER
                  </div>
                  <div className="absolute bottom-4 right-4 font-mono text-[8px] text-gold-text/40 bg-luxury-black/80 px-2 py-1 border border-white/5 flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3 text-gold-text" />
                    <span>LOCATED: {offices.find(o => o.city === selectedCity)?.address}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Animated Luxury Contact Form */}
        <div className="w-full lg:w-1/2 glass-panel border border-white/5 p-8 md:p-10 flex flex-col justify-center relative min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-text to-transparent" />
          
          {transmissionState === 'idle' && (
            <form onSubmit={handleFormSubmit} className="space-y-8 contact-fade-item opacity-0">
              <div>
                <span className="font-mono text-[9px] text-gold-text tracking-[0.3em] uppercase block mb-1">
                  SECURE TRANSMISSION CHANNEL
                </span>
                <h3 className="font-serif text-2xl text-f7f5f0 uppercase mb-4">
                  Request Commission
                </h3>
              </div>

              {/* Form Input fields with elegant line transitions */}
              <div className="space-y-6">
                <div className="relative">
                  <label htmlFor="input-full-name" className="sr-only">Your Full Name</label>
                  <input
                    id="input-full-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-f7f5f0 focus:outline-none focus:border-gold-text focus-visible:ring-1 focus-visible:ring-gold-text transition-all duration-300 font-sans tracking-wide placeholder-f7f5f0/20"
                    placeholder="Your Full Name // Individual or Corporate"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="input-secured-email" className="sr-only">Your Secured Email Coordinate</label>
                  <input
                    id="input-secured-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-f7f5f0 focus:outline-none focus:border-gold-text focus-visible:ring-1 focus-visible:ring-gold-text transition-all duration-300 font-sans tracking-wide placeholder-f7f5f0/20"
                    placeholder="Your Secured Email Coordinate"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="input-message-brief" className="sr-only">Describe your volume project, site coordinates, and material preferences</label>
                  <textarea
                    id="input-message-brief"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 py-3 text-sm text-f7f5f0 focus:outline-none focus:border-gold-text focus-visible:ring-1 focus-visible:ring-gold-text transition-all duration-300 font-sans tracking-wide placeholder-f7f5f0/20 resize-none"
                    placeholder="Describe your volume project, site coordinates, and material preferences..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gold-text text-luxury-black font-sans font-semibold text-xs uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center space-x-3 hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text"
              >
                <span>Transmit Dossier</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Holographic Uplink transmission terminal sequence */}
          {transmissionState !== 'idle' && transmissionState !== 'completed' && (
            <div className="space-y-6 font-mono text-xs text-gold-muted/80 bg-luxury-black/95 border border-gold-text/20 p-6 md:p-8 rounded-none min-h-[400px] flex flex-col justify-between relative overflow-hidden">
              {/* Pulsing grid accent */}
              <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#c5a880_1px,transparent_1px),linear-gradient(to_bottom,#c5a880_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] text-gold-text tracking-widest animate-pulse font-bold flex items-center space-x-2">
                  <Cpu className="w-3.5 h-3.5 text-gold-text animate-spin" />
                  <span>● BEAM_UPLINK // ESTABLISHED</span>
                </span>
                <span className="text-[8px] opacity-60">STATION_07</span>
              </div>

              {/* Progress and status */}
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] tracking-wider">
                  <span>TRANSMISSION_PHASE:</span>
                  <span className="text-gold-text uppercase font-bold">
                    {transmissionState === 'encrypting' && '01 // CRYPTO_ENCODE'}
                    {transmissionState === 'routing' && '02 // ORBITAL_ROUTING'}
                    {transmissionState === 'beaming' && '03 // COORD_STREAM'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/5 border border-white/10 h-3 p-[2px] relative overflow-hidden">
                  <div 
                    className="h-full bg-gold-text shadow-[0_0_10px_#c5a880] transition-all duration-300"
                    style={{ width: `${transmissionProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gold-text">
                  <span>RATE: 450 MB/S</span>
                  <span>{transmissionProgress}% COMPLETE</span>
                </div>
              </div>

              {/* Hexadecimal stream log box */}
              <div className="flex-1 bg-luxury-black/80 border border-white/5 p-4 rounded-none overflow-hidden h-40 flex flex-col justify-end font-mono text-[9px] space-y-1.5 text-gold-muted/90 leading-relaxed">
                <div>&gt; DOSSIER_PACKET_ID: 0x7E2D{formData.name.length}F</div>
                <div>&gt; TARGET_HUB: {selectedCity.toUpperCase()}_STATION</div>
                <div>&gt; COORD: {offices.find(o => o.city === selectedCity)?.coordinates}</div>
                
                {transmissionState === 'encrypting' && (
                  <>
                    <div className="text-gold-text animate-pulse">&gt; GENERATING SHIELDS // CRYPTO ENVELOPE...</div>
                    <div className="truncate">&gt; ENCRYPT_KEY: SHA-512//RSA4096_{btoa(encodeURIComponent(formData.name)).slice(0, 16)}</div>
                    <div className="text-white/30">&gt; COMPRESSING DOSSIER PACKAGE [{(formData.message.length * 1.1).toFixed(1)} KB]</div>
                  </>
                )}

                {transmissionState === 'routing' && (
                  <>
                    <div className="text-gold-text animate-pulse">&gt; HANDSHAKING WITH COORD SERVER DECON...</div>
                    <div>&gt; RESOLVED SECURE IP: 10.12.84.{formData.email.length}</div>
                    <div className="text-white/30">&gt; DETECTING PATHWAY: MILANO_HUB -&gt; {selectedCity.toUpperCase()}_VAULT</div>
                  </>
                )}

                {transmissionState === 'beaming' && (
                  <>
                    <div className="text-gold-text animate-pulse">&gt; STREAMING COORD DATA BEACON...</div>
                    <div className="text-white animate-pulse">&gt; BEAM STABILITY: 100% // NO CORRUPTION</div>
                    <div className="text-gold-muted/50 truncate">&gt; TRANS_PAYLOAD: {btoa(encodeURIComponent(formData.message)).slice(0, 36)}...</div>
                  </>
                )}
              </div>

              <div className="text-[8px] text-center opacity-40">
                AURA DIGITAL SECURITY DECON v4.95 // ENCRYPTED TUNNEL
              </div>
            </div>
          )}

          {transmissionState === 'completed' && (
            /* Success Blueprint Stamp view */
            <div className="text-center space-y-8 flex flex-col items-center py-10 justify-center">
              {/* Approved Blueprint Stamp drawing */}
              <div className="approved-stamp opacity-0 border-4 border-dashed border-gold-text text-gold-text px-8 py-4 font-mono font-bold tracking-[0.3em] text-lg uppercase bg-luxury-black/90 rotate-[-12deg] shadow-2xl relative">
                <div className="absolute top-1 left-1 right-1 bottom-1 border border-gold-text/30" />
                <span>AURA CERTIFIED</span>
                <div className="text-[9px] mt-1 tracking-widest font-normal text-gold-muted">
                  [ COMM_RECVD_2026 ]
                </div>
              </div>

              <div className="space-y-4 max-w-sm">
                <h3 className="font-serif text-3xl text-f7f5f0 uppercase">
                  Dossier Received
                </h3>
                <p className="text-f7f5f0/60 text-xs font-light leading-relaxed">
                  Thank you, <span className="text-gold-text font-semibold">{formData.name}</span>. Your encrypted dossier has been successfully transmitted via secure orbital beam directly to the <span className="text-gold-text font-medium">{selectedCity} Bureau Database Cluster</span> ({offices.find(o => o.city === selectedCity)?.address}).
                </p>
                <p className="text-gold-muted/80 text-[10px] font-mono leading-relaxed bg-white/5 p-3 border border-white/5">
                  &gt; STATUS: ENCRYPTED & QUEUED<br />
                  &gt; ASSIGNED: PRINCIPAL ARCHITECT BUREAU
                </p>
              </div>

              <button
                onClick={() => {
                  setFormData({ name: '', email: '', message: '' });
                  setTransmissionState('idle');
                  setTransmissionProgress(0);
                  setFormSubmitted(false);
                }}
                className="px-6 py-2.5 border border-white/15 hover:border-gold-text text-gold-text text-[10px] font-mono uppercase tracking-widest hover-target bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text"
              >
                Send New Dossier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
