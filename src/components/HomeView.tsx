import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IMAGES } from '../assetsMapping';
import { ArrowRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HomeViewProps {
  setActivePage: (page: 'home' | 'about' | 'projects' | 'services' | 'process' | 'blog' | 'contact') => void;
}

export default function HomeView({ setActivePage }: HomeViewProps) {
  const [scrollY, setScrollY] = useState(0);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'granted'>('idle');
  const [vaultSelectedMaterial, setVaultSelectedMaterial] = useState<'marble' | 'basalt' | 'gold'>('marble');
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dustCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLHeadingElement>(null);
  
  // Ref for tracking mouse coordinates for parallax
  const mouseRef = useRef({ x: 0, y: 0 });

  // Page Transition helper with smooth swipe
  const navigateToPage = (page: 'projects' | 'process', path: string) => {
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
      const tl = gsap.timeline();
      tl.to(overlay, {
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        duration: 0.5,
        ease: 'power3.in',
      });
      tl.add(() => {
        setActivePage(page);
        window.history.pushState(null, '', path);
        window.scrollTo(0, 0);
      });
      tl.to(overlay, {
        clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        duration: 0.6,
        ease: 'power4.out',
        delay: 0.1,
      });
    } else {
      setActivePage(page);
      window.history.pushState(null, '', path);
    }
  };

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Track scroll in local state for reactive SVG elements
    const handleScrollProgress = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScrollProgress, { passive: true });

    // Declare handleDustResize in useEffect outer scope for cleanup accessibility
    let handleDustResize = () => {};

    // 1. Text reveals using GSAP (staggered words reveal)
    if (heroTextRef.current) {
      const chars = heroTextRef.current.querySelectorAll('.char');
      if (prefersReducedMotion) {
        gsap.set(chars, { y: '0%', opacity: 1 });
        gsap.set('.home-reveal-fade', { opacity: 1, y: 0 });
      } else {
        // Slow cinematic entrance lasting 2.5 seconds
        gsap.fromTo(chars, 
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 1.4, stagger: 0.08, ease: 'power4.out', delay: 0.3 }
        );

        gsap.fromTo('.home-reveal-fade', 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out', delay: 1.2 }
        );
      }
    }

    // 2. Slow moving light rays & luxury glass reflections
    if (!prefersReducedMotion) {
      gsap.to('.sunlight-ray', {
        xPercent: 12,
        yPercent: -8,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.glass-reflection', {
        translateX: '200%',
        duration: 3.0,
        delay: 2.0,
        ease: 'power3.inOut',
        repeat: -1,
        repeatDelay: 12
      });

      gsap.to('.scroll-dot', {
        y: 22,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }

    // 3. Track mouse for Three.js and background depth parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Subtle background depth shifts
      const bgImg = document.querySelector('.hero-bg-image');
      if (bgImg && !prefersReducedMotion) {
        const xOffset = (e.clientX / window.innerWidth - 0.5) * -45;
        const yOffset = (e.clientY / window.innerHeight - 0.5) * -45;
        gsap.to(bgImg, { x: xOffset, y: yOffset, duration: 1.0, ease: 'power2.out' });
      }
    };
    
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // 4. 2D Dust Particles Canvas Setup
    const dustCanvas = dustCanvasRef.current;
    let dustAnimationFrameId: number;
    let isElementVisible = true;

    if (dustCanvas) {
      const ctx = dustCanvas.getContext('2d');
      if (ctx) {
        let dWidth = dustCanvas.clientWidth;
        let dHeight = dustCanvas.clientHeight;
        dustCanvas.width = dWidth;
        dustCanvas.height = dHeight;

        const particlesArr: any[] = [];
        const particleCount = prefersReducedMotion ? 10 : 45;
        for (let i = 0; i < particleCount; i++) {
          particlesArr.push({
            x: Math.random() * dWidth,
            y: Math.random() * dHeight,
            size: Math.random() * 1.5 + 0.3,
            speedX: (Math.random() - 0.5) * 0.15,
            speedY: -Math.random() * 0.3 - 0.08,
            opacity: Math.random() * 0.4 + 0.08
          });
        }

        const animateDust = () => {
          if (!isElementVisible) {
            dustAnimationFrameId = requestAnimationFrame(animateDust);
            return;
          }
          ctx.clearRect(0, 0, dWidth, dHeight);
          ctx.fillStyle = '#c5a880';
          
          particlesArr.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y < 0) {
              p.y = dHeight;
              p.x = Math.random() * dWidth;
            }
            if (p.x < 0 || p.x > dWidth) {
              p.x = Math.random() * dWidth;
            }
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
          
          dustAnimationFrameId = requestAnimationFrame(animateDust);
        };

        animateDust();

        // Handle dust resize
        handleDustResize = () => {
          if (dustCanvas) {
            dWidth = dustCanvas.clientWidth;
            dHeight = dustCanvas.clientHeight;
            dustCanvas.width = dWidth;
            dustCanvas.height = dHeight;
          }
        };
        window.addEventListener('resize', handleDustResize, { passive: true });
      }
    }

    // 5. Three.js Living Room Maquette setup
    const canvasContainer = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!canvasContainer || !canvas) return;

    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#080808', 0.07);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !prefersReducedMotion;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // SCENE ELEMENTS (Optimized geometries & simple materials to save GPU draw calls)
    // Luxury base marble platform
    const floorGeo = new THREE.BoxGeometry(10, 0.1, 10);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x111111, 
      roughness: 0.12, 
      metalness: 0.85,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Back concrete-slate column
    const wallGeo = new THREE.BoxGeometry(2.8, 4, 0.3);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x161616,
      roughness: 0.75,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(-1.8, 1, -2);
    wall.receiveShadow = true;
    scene.add(wall);

    // Modern Luxury Gold Pillar
    const pillarGeo = new THREE.CylinderGeometry(0.14, 0.14, 3, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xc5a880,
      metalness: 0.85,
      roughness: 0.15,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(2, 0.5, -1);
    scene.add(pillar);

    // Abstract Central Sculpture on marble stand
    const standGeo = new THREE.BoxGeometry(1.0, 0.8, 1.0);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.25 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(0, -0.6, 0);
    stand.receiveShadow = true;
    scene.add(stand);

    // Torus knot geometry for the rotating focal sculpture
    const sculptGeo = new THREE.TorusKnotGeometry(0.35, 0.09, 80, 16);
    const sculptMat = new THREE.MeshStandardMaterial({
      color: 0xc5a880,
      metalness: 0.98,
      roughness: 0.05,
    });
    const sculpt = new THREE.Mesh(sculptGeo, sculptMat);
    sculpt.position.set(0, 0.1, 0);
    scene.add(sculpt);

    // Glowing Neon rod light
    const rodGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.2, 8);
    const rodMat = new THREE.MeshBasicMaterial({ color: 0xc5a880 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.position.set(-1.5, 0.8, 0.5);
    rod.rotation.z = Math.PI / 12;
    scene.add(rod);

    // FLOATING PARTICLES
    const particleCount = prefersReducedMotion ? 25 : 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8; // X
      positions[i + 1] = (Math.random() - 0.5) * 4 + 0.5; // Y
      positions[i + 2] = (Math.random() - 0.5) * 6; // Z
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc5a880,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // LIGHTING (Optimized atmospheric setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Primary shadow-casting light (directional)
    const dirLight = new THREE.DirectionalLight(0xfff5e6, 3.2);
    dirLight.position.set(4, 5, 3);
    dirLight.castShadow = !prefersReducedMotion;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Spotlight pointing at centerpiece
    const spotLight = new THREE.SpotLight(0xc5a880, 8, 12, Math.PI / 5, 0.5, 1);
    spotLight.position.set(0, 4.0, 1.8);
    spotLight.target = stand;
    spotLight.castShadow = false;
    scene.add(spotLight);

    // RESIZEOBSERVER - debounced
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

    // PAUSE ANIMATIONS WHEN OFF-SCREEN
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isElementVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(canvasContainer);

    const handleVisibilityChange = () => {
      isElementVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ANIMATION LOOP WITH SCROLL PARALLAX SENSING
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isElementVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const elapsedTime = clock.getElapsedTime();
      const scrollY = window.scrollY;

      // Slow self-rotations
      sculpt.rotation.y = elapsedTime * 0.22 + scrollY * 0.003;
      sculpt.rotation.x = elapsedTime * 0.08;

      // Rotate particles group
      particles.rotation.y = elapsedTime * 0.015;
      particles.position.y = Math.sin(elapsedTime * 0.3) * 0.06;
      
      // Twinkle particle size
      particleMat.size = 0.045 + Math.sin(elapsedTime * 2.5) * 0.015;

      // Pulse spotlight slowly to simulate dynamic kinetic vectors
      spotLight.intensity = 7 + Math.sin(elapsedTime * 0.6) * 1.5;

      // Update camera position using lerp, mouse parallax, and vertical scrolling integration
      if (!prefersReducedMotion) {
        const targetCamX = mouseRef.current.x * 2.2 + Math.sin(elapsedTime * 0.08) * 0.3;
        // The camera sinks as we scroll, creating a highly premium immersive transition
        const targetCamY = 1.8 + mouseRef.current.y * 1.5 + Math.sin(elapsedTime * 0.05) * 0.1 - (scrollY * 0.0035);
        const targetCamZ = 6.8 - (scrollY * 0.0035);
        
        camera.position.x += (targetCamX - camera.position.x) * 0.045;
        camera.position.y += (targetCamY - camera.position.y) * 0.045;
        camera.position.z += (targetCamZ - camera.position.z) * 0.045;
      } else {
        camera.position.x = Math.sin(elapsedTime * 0.02) * 0.12;
        camera.position.y = 1.8 - (scrollY * 0.001);
      }
      
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 6. SCROLL CHOREOGRAPHY (unique reveals, mask sweeps & decorative lines)
    if (!prefersReducedMotion) {
      // Draw SVG blueprint vector guidelines on scroll
      gsap.fromTo('.blueprint-scroll-line', 
        { strokeDashoffset: 1000 },
        {
          strokeDashoffset: 0,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2
          }
        }
      );

      // Featured Project Image Mask wipe reveal
      gsap.fromTo('.featured-image-container',
        { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
        {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          duration: 1.6,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: '.featured-section',
            start: 'top 75%',
          }
        }
      );

      // Featured Project Text reveal from right
      gsap.fromTo('.featured-text-reveal',
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.featured-section',
            start: 'top 70%',
          }
        }
      );

      // Manifesto Section: deep letters expand & fade
      gsap.fromTo('.manifesto-letter-reveal',
        { letterSpacing: '0.1em', y: 40, opacity: 0 },
        {
          letterSpacing: '0.25em',
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.manifesto-section',
            start: 'top 80%',
          }
        }
      );

      gsap.fromTo('.manifesto-fade-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.manifesto-section',
            start: 'top 70%',
          }
        }
      );
    } else {
      // Fallback for reduced motion users
      gsap.set('.featured-text-reveal, .manifesto-letter-reveal, .manifesto-fade-item', { opacity: 1, x: 0, y: 0 });
      gsap.set('.featured-image-container', { clipPath: 'none' });
    }

    // 7. MAGNETIC PREMIUM CTA BUTTONS INTEGRATION
    const hostContainer = containerRef.current;
    if (hostContainer && !prefersReducedMotion) {
      const magnetics = hostContainer.querySelectorAll('.premium-magnetic-cta');
      magnetics.forEach(btn => {
        const onBtnMouseMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          
          gsap.to(btn, {
            x: x * 0.35,
            y: y * 0.35,
            scale: 1.03,
            duration: 0.3,
            ease: 'power2.out'
          });
          
          const arrow = btn.querySelector('.btn-arrow');
          if (arrow) {
            gsap.to(arrow, {
              x: 5,
              duration: 0.2,
              ease: 'power1.out'
            });
          }
        };
        
        const onBtnMouseLeave = () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power3.out'
          });
          
          const arrow = btn.querySelector('.btn-arrow');
          if (arrow) {
            gsap.to(arrow, {
              x: 0,
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        };
        
        btn.addEventListener('mousemove', onBtnMouseMove as any);
        btn.addEventListener('mouseleave', onBtnMouseLeave as any);
      });
    }

    // 8. 3D CARD PARALLAX TILT FOR FEATURED IMAGE CARD (BOLDER 26 DEGREE ANGLE)
    const card = hostContainer?.querySelector('.featured-card');
    if (card && !prefersReducedMotion) {
      const handleCardMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const rotateY = ((x / rect.width) - 0.5) * 26;
        const rotateX = -((y / rect.height) - 0.5) * 26;

        gsap.to(card, {
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
          duration: 0.4,
          ease: 'power2.out'
        });

        // Layered 3D element displacement for unmatched Awwwards luxury depth feel
        const textSpan = card.querySelector('.featured-text-lift');
        const badgeSpan = card.querySelector('.featured-badge-lift');
        if (textSpan) {
          gsap.to(textSpan, {
            x: ((x / rect.width) - 0.5) * 22,
            y: ((y / rect.height) - 0.5) * 22,
            duration: 0.4,
            ease: 'power2.out'
          });
        }
        if (badgeSpan) {
          gsap.to(badgeSpan, {
            x: ((x / rect.width) - 0.5) * 12,
            y: ((y / rect.height) - 0.5) * 12,
            duration: 0.4,
            ease: 'power2.out'
          });
        }

        // Move lighting glare flare
        const glare = card.querySelector('.glare-light') as HTMLElement;
        if (glare) {
          gsap.to(glare, {
            left: `${x}px`,
            top: `${y}px`,
            opacity: 0.25,
            duration: 0.2,
            ease: 'power1.out'
          });
        }
      };

      const handleCardMouseLeave = () => {
        gsap.to(card, {
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          duration: 0.6,
          ease: 'power3.out'
        });

        const textSpan = card.querySelector('.featured-text-lift');
        const badgeSpan = card.querySelector('.featured-badge-lift');
        if (textSpan) {
          gsap.to(textSpan, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' });
        }
        if (badgeSpan) {
          gsap.to(badgeSpan, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' });
        }

        const glare = card.querySelector('.glare-light');
        if (glare) {
          gsap.to(glare, { opacity: 0, duration: 0.4 });
        }
      };

      card.addEventListener('mousemove', handleCardMouseMove as any);
      card.addEventListener('mouseleave', handleCardMouseLeave as any);
    }

    // Cleanup WebGL + Listeners
    return () => {
      window.removeEventListener('scroll', handleScrollProgress);
      if (!prefersReducedMotion) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('resize', handleDustResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      cancelAnimationFrame(dustAnimationFrameId);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());

      renderer.dispose();
      sculptGeo.dispose();
      sculptMat.dispose();
      standGeo.dispose();
      standMat.dispose();
      pillarGeo.dispose();
      pillarMat.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      rodGeo.dispose();
      rodMat.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full bg-luxury-black overflow-hidden flex flex-col justify-between">
      
      {/* ───────────────── BACKGROUND GUIDELINE GRAPHICS ───────────────── */}
      <div className="absolute inset-y-0 left-12 w-[1px] bg-white/5 pointer-events-none z-5 hidden md:block" />
      <div className="absolute inset-y-0 right-12 w-[1px] bg-white/5 pointer-events-none z-5 hidden md:block" />
      
      {/* Background blueprint grid overlay */}
      <div className="absolute inset-0 blueprint-grid z-0 opacity-15 pointer-events-none" />

      {/* Background SVG Blueprint Line drawer (scrubbed to scroll) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5 select-none opacity-20 hidden lg:block" viewBox="0 0 1440 2400" fill="none">
        {/* Dynamic sweeping lines */}
        <path 
          className="blueprint-scroll-line stroke-gold-text stroke-[0.5]" 
          strokeDasharray="1000"
          strokeDashoffset="1000"
          d="M120 150 L120 2200 M1320 150 L1320 2200 M120 600 L1320 600 M120 1400 L1320 1400" 
        />
        <circle 
          className="blueprint-scroll-line stroke-gold-text stroke-[0.5] opacity-40" 
          strokeDasharray="1000"
          strokeDashoffset="1000"
          cx="1320" cy="900" r="120" 
        />
        <circle 
          className="blueprint-scroll-line stroke-gold-text stroke-[0.5] opacity-40" 
          strokeDasharray="1000"
          strokeDashoffset="1000"
          cx="120" cy="1800" r="220" 
        />
      </svg>

      {/* ───────────────── SECTION 1: HERO VIEWPORT ───────────────── */}
      <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden">
        
        {/* Immersive background photo render with slow-zoom scale */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={IMAGES.heroVilla} 
            alt="Bespoke luxury interior villa render" 
            referrerPolicy="no-referrer"
            loading="eager"
            className="hero-bg-image w-full h-full object-cover opacity-30 filter brightness-75 scale-105 transition-transform duration-[4s]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/65 to-transparent" />
        </div>

        {/* 2D Dust Particles Overlay Canvas */}
        <canvas ref={dustCanvasRef} className="absolute inset-0 z-1 pointer-events-none opacity-60 w-full h-full" />

        {/* Cinematic Sunlight Ray Overlay */}
        <div className="absolute inset-0 z-1 pointer-events-none mix-blend-screen opacity-35">
          <div 
            className="sunlight-ray absolute top-[-60%] left-[-20%] w-[150%] h-[200%] rotate-[30deg]"
            style={{
              background: 'linear-gradient(115deg, transparent 30%, rgba(255, 245, 230, 0.08) 45%, rgba(255, 245, 230, 0.18) 50%, rgba(255, 245, 230, 0.08) 55%, transparent 70%)',
              willChange: 'transform'
            }}
          />
        </div>

        {/* Luxury Glass Reflection Overlay */}
        <div className="absolute inset-0 z-1 pointer-events-none opacity-15">
          <div 
            className="glass-reflection absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{
              transform: 'skewX(-28deg) translateX(-100%)',
              willChange: 'transform'
            }}
          />
        </div>

        {/* Floating Three.js Canvas container for 3D room overlay */}
        <div 
          ref={canvasContainerRef} 
          className="absolute inset-0 z-10 pointer-events-none opacity-75 md:opacity-100"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Content Layer (Stands in front of WebGL canvas) */}
        <div className="relative z-20 w-full flex-grow flex items-center px-6 md:px-16 pt-32 pb-12">
          <div className="max-w-4xl text-left pl-0 md:pl-8">
            
            {/* Subtle Project Category/Meta */}
            <div className="home-reveal-fade flex items-center space-x-2 text-gold-text mb-5 opacity-0">
              <Sparkles className="w-4 h-4 text-gold-text animate-pulse" />
              <span className="font-mono text-xs tracking-[0.4em] uppercase">DOCUMENTARY_SERIES_01</span>
            </div>

            {/* Staggered Heading Reveal */}
            <h1 
              ref={heroTextRef} 
              className="font-serif text-5xl md:text-8xl tracking-tight text-f7f5f0 uppercase font-light leading-[1.05]"
            >
              <span className="block overflow-hidden char-clip">
                <span className="inline-block char">Bespoke</span>
              </span>
              <span className="block overflow-hidden char-clip text-gold-text">
                <span className="inline-block char">Atmospheres</span>
              </span>
              <span className="block overflow-hidden char-clip">
                <span className="inline-block char">Created By Light</span>
              </span>
            </h1>

            {/* Luxury Description */}
            <p className="home-reveal-fade max-w-xl text-f7f5f0/70 text-sm md:text-base tracking-wide leading-relaxed font-light mt-8 opacity-0">
              AURA is a world-renowned creative design atelier. We map natural geometries, marble patterns, and kinetic light vectors into spatial masterpieces that feel like physical poetry.
            </p>

            {/* Premium CTA Buttons */}
            <div className="home-reveal-fade mt-10 flex flex-wrap gap-5 items-center opacity-0">
              <button
                onClick={() => navigateToPage('projects', '/gallery')}
                className="premium-magnetic-cta hover:shadow-[0_0_20px_rgba(197,168,128,0.25)] relative px-8 py-4 bg-gold-text text-luxury-black font-sans font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 rounded-none flex items-center space-x-3 hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text"
                aria-label="Explore Projects Gallery"
              >
                <span>Explore Gallery</span>
                <ArrowRight className="btn-arrow w-4 h-4 transition-transform duration-300" />
              </button>

              <button
                onClick={() => navigateToPage('process', '/blueprint')}
                className="premium-magnetic-cta hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] relative px-8 py-4 border border-f7f5f0/20 hover:border-gold-text text-f7f5f0 hover:text-gold-text font-sans font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 rounded-none hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text"
                aria-label="Learn Our Architectural Blueprint"
              >
                Learn Blueprint
              </button>
            </div>
          </div>
        </div>

        {/* Premium Scroll Indicator */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center space-y-2 pointer-events-none home-reveal-fade opacity-0">
          <span className="font-mono text-[8px] text-gold-text/80 tracking-[0.4em] uppercase">Scroll to explore</span>
          <div className="w-5 h-12 border border-gold-text/40 rounded-full relative flex justify-center py-1 bg-luxury-black/60 shadow-[0_0_15px_rgba(197,168,128,0.1)]">
            <div className="w-[1px] h-full bg-white/10 absolute left-1/2 -translate-x-1/2 top-0" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold-text scroll-dot shadow-[0_0_10px_#c5a880]" style={{ willChange: 'transform' }} />
          </div>
        </div>

        {/* Decorative Technical Info Bar */}
        <div className="relative z-20 w-full border-t border-white/5 py-6 px-6 md:px-16 flex flex-wrap items-center justify-between text-[10px] font-mono text-gold-muted/60 bg-luxury-black/40 backdrop-blur-md gap-4">
          <div className="flex space-x-8">
            <span>COORDINATES: 45° 27&apos; 51.84&quot; N, 9° 11&apos; 22.46&quot; E</span>
            <span className="hidden md:inline">SYSTEM: VER-3.2.0 [ONLINE]</span>
          </div>
          <div className="flex space-x-4 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-text" />
            <span>BESPOKE MILANO ATMOSPHERES © 2026</span>
          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 2: FEATURED SHOWCASE ───────────────── */}
      <section className="featured-section relative w-full min-h-screen flex items-center py-28 px-6 md:px-16 z-10 bg-luxury-dark/95 border-y border-white/5 overflow-hidden">
        
        {/* Background glow layer */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-text/5 rounded-full filter blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-10">
          
          {/* Left Column: Interactive 3D Parallax image card */}
          <div className="col-span-1 lg:col-span-7 flex justify-center">
            <div 
              className="featured-image-container w-full max-w-xl overflow-hidden shadow-2xl relative border border-white/5 featured-card group cursor-pointer bg-luxury-gray"
              style={{ transformStyle: 'preserve-3d', willChange: 'transform, clip-path' }}
            >
              {/* Radial Lighting glare flare */}
              <div 
                className="glare-light absolute w-48 h-48 rounded-full bg-gold-text opacity-0 pointer-events-none z-20 blur-3xl -translate-x-1/2 -translate-y-1/2"
                style={{ mixBlendMode: 'screen' }}
              />

              <div className="relative h-80 md:h-[450px] overflow-hidden pointer-events-none">
                <img 
                  src={IMAGES.heroVilla} 
                  alt="Aether Villa Curated Case Study" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 filter brightness-90"
                />
                
                {/* Visual glass gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-transparent to-transparent z-10" />
                
                {/* Monospace overlay labels with 3D Depth Shift */}
                <div className="featured-badge-lift absolute top-6 left-6 px-3 py-1 bg-luxury-black/85 border border-white/10 font-mono text-[9px] text-gold-text uppercase tracking-widest z-20 transition-all duration-300">
                  FLAGSHIP SPECIFICATION // RESIDENTIAL
                </div>

                {/* Animated Captions with 3D Depth Shift */}
                <div className="featured-text-lift absolute bottom-6 left-6 z-20 font-serif text-2xl tracking-wide text-f7f5f0 uppercase overflow-hidden transition-all duration-300">
                  <span className="block translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">
                    Aether Villa
                  </span>
                  <span className="block font-mono text-[9px] text-gold-muted uppercase tracking-[0.2em] mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    LAKE COMO, ITALY // EST. 2023
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Spec content & description */}
          <div className="col-span-1 lg:col-span-5 space-y-6 text-left pl-0 lg:pl-6">
            <span className="featured-text-reveal font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-2 opacity-0">
              FEATURED MASTERPIECE
            </span>
            
            <h2 className="featured-text-reveal font-serif text-4xl md:text-5xl text-f7f5f0 uppercase font-light tracking-tight leading-none opacity-0">
              Aether <br />
              <span className="text-gold-text">Architectural</span> Villa
            </h2>

            <div className="featured-text-reveal w-16 h-[1px] bg-gold-text/50 opacity-0" />

            <p className="featured-text-reveal text-f7f5f0/70 text-sm md:text-base leading-relaxed font-light opacity-0">
              A striking structural composition featuring cantilevered floor-to-ceiling glass systems, floating concrete frames, and gold-trimmed basalt walls overlooking the misty Lake Como.
            </p>

            {/* Technical dossiers table */}
            <div className="featured-text-reveal space-y-3 font-mono text-[10px] text-gold-muted border-t border-white/5 pt-6 opacity-0">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>PROJECT LOCATION:</span>
                <span className="text-f7f5f0">LAKE COMO, ITALY</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>VOLUME DIMENSIONS:</span>
                <span className="text-f7f5f0">420 SQM // STRUCTURAL GLASS</span>
              </div>
              <div className="flex justify-between py-1">
                <span>CONSTRUCTION PHASE:</span>
                <span className="text-f7f5f0">COMPLETED // ARCHIVED</span>
              </div>
            </div>

            {/* Magnetic CTA redirect button */}
            <div className="featured-text-reveal pt-4 opacity-0">
              <button
                onClick={() => navigateToPage('projects', '/gallery')}
                className="premium-magnetic-cta hover:shadow-[0_0_20px_rgba(197,168,128,0.25)] relative px-6 py-3 bg-transparent border border-gold-text/40 hover:border-gold-text text-gold-text hover:text-luxury-black hover:bg-gold-text font-sans font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 rounded-none flex items-center space-x-3 hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text"
              >
                <span>View Interactive Specs</span>
                <ArrowRight className="btn-arrow w-4 h-4 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── SECTION 2.5: SECURE CLIENT PORTAL / DOSSIER VAULT ───────────────── */}
      <section className="vault-section relative w-full py-24 px-6 md:px-16 z-10 bg-luxury-black border-t border-white/5 overflow-hidden flex items-center justify-center">
        {/* Ambient warning blueprint grid lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#c5a880_1px,transparent_1px),linear-gradient(to_bottom,#c5a880_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gold-text/5 rounded-full filter blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto w-full text-center relative z-10 space-y-8 glass-panel p-10 md:p-14 border border-white/5 bg-luxury-gray/15">
          <span className="font-mono text-[9px] text-gold-text tracking-[0.4em] uppercase block">
            CLASSIFIED ACCESS SYSTEM
          </span>

          <h2 className="font-serif text-3xl md:text-4xl text-f7f5f0 uppercase font-light tracking-tight leading-none">
            BespoKe Client <br />
            <span className="text-gold-text font-serif">Dossier Vault</span>
          </h2>

          <p className="max-w-xl mx-auto text-f7f5f0/60 text-xs md:text-sm tracking-wide leading-relaxed font-light">
            An encrypted interactive terminal designed exclusively for our elite clientele. Uncover architectural volume coordinates, select premium material specs, and render physical sample details.
          </p>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                setVaultOpen(true);
                setScanStatus('idle');
              }}
              className="px-8 py-4 bg-transparent border border-gold-text/40 hover:border-gold-text text-gold-text hover:text-luxury-black hover:bg-gold-text font-sans font-medium text-xs uppercase tracking-[0.25em] transition-all duration-500 rounded-none flex items-center space-x-3 hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text shadow-[0_0_15px_rgba(197,168,128,0.1)]"
            >
              <ShieldCheck className="w-4 h-4 text-gold-text group-hover:text-luxury-black" />
              <span>Initialize Biometric Scan</span>
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────── SECURE CLIENT VAULT OVERLAY MODAL ───────────────── */}
      {vaultOpen && (
        <div className="fixed inset-0 z-[10000] bg-luxury-black/98 backdrop-blur-2xl flex items-center justify-center p-6 md:p-12 overflow-y-auto">
          {/* Custom scan grid background */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#c5a880_1px,transparent_1px),linear-gradient(to_bottom,#c5a880_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <div className="w-full max-w-4xl bg-luxury-dark/95 border border-white/10 p-6 md:p-12 rounded-none relative z-10 shadow-2xl flex flex-col justify-between min-h-[80vh] md:min-h-[70vh]">
            
            {/* Top Bar telemetry */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6 font-mono text-[9px] text-gold-muted">
              <span>SECURE_CONNECTION: ESTABLISHED [AES-256]</span>
              <span>CLIENT_STATION_ID: MILANO_ATELIER_04</span>
            </div>

            {/* SCANNING PHASE */}
            {scanStatus !== 'granted' && (
              <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-8">
                <div className="text-center space-y-2">
                  <span className="font-mono text-[9px] text-gold-text tracking-[0.3em] uppercase block">BIOMETRIC AUTHENTICATION</span>
                  <h3 className="font-serif text-2xl text-f7f5f0 uppercase font-light tracking-wide">Place Finger to Align Calibration</h3>
                </div>

                {/* Fingerprint Interactive Scan Widget */}
                <div 
                  onMouseDown={() => {
                    setScanStatus('scanning');
                    setTimeout(() => {
                      setScanStatus('granted');
                    }, 1800);
                  }}
                  onTouchStart={() => {
                    setScanStatus('scanning');
                    setTimeout(() => {
                      setScanStatus('granted');
                    }, 1800);
                  }}
                  className={`w-28 h-28 border border-gold-text/30 rounded-full flex items-center justify-center cursor-pointer relative transition-all duration-300 ${
                    scanStatus === 'scanning' ? 'scale-105 border-gold-text shadow-[0_0_20px_rgba(197,168,128,0.3)]' : 'hover:border-gold-text hover:bg-white/5'
                  }`}
                >
                  {/* Glowing core */}
                  <div className={`w-20 h-20 rounded-full border border-dashed border-gold-text/20 flex items-center justify-center transition-all ${
                    scanStatus === 'scanning' ? 'animate-pulse border-gold-text' : ''
                  }`}>
                    <Compass className={`w-8 h-8 text-gold-text transition-transform duration-1000 ${scanStatus === 'scanning' ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Active Scanning Sweep Line */}
                  {scanStatus === 'scanning' && (
                    <div className="absolute left-0 w-full h-0.5 bg-gold-text/80 shadow-[0_0_10px_#c5a880] animate-[bounce_1.8s_infinite] top-0" />
                  )}
                </div>

                {/* Log outputs */}
                <div className="w-full max-w-sm font-mono text-[9px] text-gold-muted/80 bg-luxury-black/40 border border-white/5 p-4 rounded-none h-24 overflow-hidden flex flex-col justify-end space-y-1">
                  {scanStatus === 'idle' && (
                    <>
                      <div className="text-gold-text/60">&gt; STATUS: STANDBY // ACCESS RESTRICTED</div>
                      <div>&gt; PRESS AND HOLD SCANNER KEY TO EMIT OPTICAL VECTOR</div>
                    </>
                  )}
                  {scanStatus === 'scanning' && (
                    <>
                      <div className="text-gold-text animate-pulse">&gt; OPTICAL CALIBRATION IN PROGRESS...</div>
                      <div>&gt; TRANSMITTING MILANO BLUEPRINT COORDINATES...</div>
                      <div className="text-gold-muted/50">&gt; KEY DECRYPTION HASH: 0x8F9E3C2B</div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ACCESS GRANTED: THE ARCHITECTURAL MATERIAL DOSSIERS */}
            {scanStatus === 'granted' && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-4">
                
                {/* Left side: Selector controls */}
                <div className="col-span-1 md:col-span-5 flex flex-col space-y-4">
                  <span className="font-mono text-[9px] text-gold-text tracking-[0.4em] uppercase block">AUTHENTICATION // GRANTED</span>
                  <h3 className="font-serif text-3xl text-f7f5f0 uppercase font-light tracking-wide">Bespoke Material Suite</h3>
                  <p className="font-mono text-[10px] text-gold-muted leading-relaxed">
                    Preview premium architectural materials utilized in current flagship specifications. Toggle the selection below to inspect.
                  </p>

                  <div className="flex flex-col space-y-2 pt-4">
                    <button
                      onClick={() => setVaultSelectedMaterial('marble')}
                      className={`px-4 py-3 text-left font-sans text-xs uppercase tracking-widest transition-all ${
                        vaultSelectedMaterial === 'marble' ? 'bg-gold-text text-luxury-black font-semibold' : 'bg-white/5 text-f7f5f0 hover:bg-white/10'
                      }`}
                    >
                      01 // Italian Carrara Marble
                    </button>
                    <button
                      onClick={() => setVaultSelectedMaterial('basalt')}
                      className={`px-4 py-3 text-left font-sans text-xs uppercase tracking-widest transition-all ${
                        vaultSelectedMaterial === 'basalt' ? 'bg-gold-text text-luxury-black font-semibold' : 'bg-white/5 text-f7f5f0 hover:bg-white/10'
                      }`}
                    >
                      02 // Golden Volcanic Basalt
                    </button>
                    <button
                      onClick={() => setVaultSelectedMaterial('gold')}
                      className={`px-4 py-3 text-left font-sans text-xs uppercase tracking-widest transition-all ${
                        vaultSelectedMaterial === 'gold' ? 'bg-gold-text text-luxury-black font-semibold' : 'bg-white/5 text-f7f5f0 hover:bg-white/10'
                      }`}
                    >
                      03 // Brushed Champagne Gold
                    </button>
                  </div>
                </div>

                {/* Right side: Dynamic presentation card */}
                <div className="col-span-1 md:col-span-7 h-full flex items-center justify-center">
                  <div className="w-full max-w-sm glass-panel p-6 border border-white/10 bg-luxury-gray/10 relative overflow-hidden transition-all duration-700 shadow-xl min-h-[280px] flex flex-col justify-between">
                    
                    {/* Background color block matching selection */}
                    <div className={`absolute inset-0 opacity-10 transition-all duration-500 pointer-events-none ${
                      vaultSelectedMaterial === 'marble' ? 'bg-white' : vaultSelectedMaterial === 'basalt' ? 'bg-[#3a352d]' : 'bg-gold-text'
                    }`} />

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-mono text-[9px] text-gold-text tracking-widest">SPEC_INDEX_0{vaultSelectedMaterial === 'marble' ? '1' : vaultSelectedMaterial === 'basalt' ? '2' : '3'}</span>
                        <span className="font-mono text-[8px] text-gold-muted">VERIFIED // AUTHENTIC</span>
                      </div>

                      {vaultSelectedMaterial === 'marble' && (
                        <div className="space-y-3">
                          <h4 className="font-serif text-2xl text-f7f5f0 uppercase tracking-wide">Carrara Marble</h4>
                          <p className="font-sans text-xs text-f7f5f0/70 leading-relaxed font-light">
                            Exquisite white marble featuring fine grey-gold veins, quarried in Tuscany. Highly polished to reflect kinetic lighting vectors.
                          </p>
                          <div className="pt-4 border-t border-white/5 space-y-2 font-mono text-[9px] text-gold-muted">
                            <div className="flex justify-between"><span>DENSITY:</span><span className="text-f7f5f0">2710 kg/m³</span></div>
                            <div className="flex justify-between"><span>ORIGIN:</span><span className="text-f7f5f0">APUAN ALPS, ITALY</span></div>
                            <div className="flex justify-between"><span>COMPRESSIVE STRENGTH:</span><span className="text-f7f5f0">120 MPa</span></div>
                          </div>
                        </div>
                      )}

                      {vaultSelectedMaterial === 'basalt' && (
                        <div className="space-y-3">
                          <h4 className="font-serif text-2xl text-f7f5f0 uppercase tracking-wide">Volcanic Basalt</h4>
                          <p className="font-sans text-xs text-f7f5f0/70 leading-relaxed font-light">
                            Extrusive igneous volcanic rock structured with raw textured alignments, finished with brushed golden seams.
                          </p>
                          <div className="pt-4 border-t border-white/5 space-y-2 font-mono text-[9px] text-gold-muted">
                            <div className="flex justify-between"><span>DENSITY:</span><span className="text-f7f5f0">2950 kg/m³</span></div>
                            <div className="flex justify-between"><span>ORIGIN:</span><span className="text-f7f5f0">SICILY, MOUNT ETNA</span></div>
                            <div className="flex justify-between"><span>COMPRESSIVE STRENGTH:</span><span className="text-f7f5f0">180 MPa</span></div>
                          </div>
                        </div>
                      )}

                      {vaultSelectedMaterial === 'gold' && (
                        <div className="space-y-3">
                          <h4 className="font-serif text-2xl text-f7f5f0 uppercase tracking-wide">Champagne Gold</h4>
                          <p className="font-sans text-xs text-f7f5f0/70 leading-relaxed font-light">
                            Our proprietary premium finish. Matte brushed brass alloy electroplated with fine gold trace particles to catch ambient sunlight.
                          </p>
                          <div className="pt-4 border-t border-white/5 space-y-2 font-mono text-[9px] text-gold-muted">
                            <div className="flex justify-between"><span>FINISH VALUE:</span><span className="text-f7f5f0">24K ELECTROPLATE</span></div>
                            <div className="flex justify-between"><span>REFLECTIVITY RATE:</span><span className="text-f7f5f0">88.5% // SUN-TUNED</span></div>
                            <div className="flex justify-between"><span>APPLICATIONS:</span><span className="text-f7f5f0">PILLARS & EMBOSS SEAMS</span></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-[8px] font-mono text-gold-muted/50 text-right mt-6">
                      AURA DESIGN ATELIER MASTER ARCHIVES
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Bar Controls */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-6">
              <span className="font-mono text-[8px] text-gold-muted/50">CLOSE THIS TO RETURN TO CORE TERMINAL</span>
              <button
                onClick={() => setVaultOpen(false)}
                className="px-6 py-2 border border-white/10 hover:border-gold-text text-f7f5f0 hover:text-gold-text font-mono text-[9px] tracking-widest uppercase transition-colors rounded-none"
              >
                [ DISMISS SYSTEM ]
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ───────────────── SECTION 3: ATELIER PHILOSOPHY / MANIFESTO ───────────────── */}
      <section className="manifesto-section relative w-full py-28 px-6 md:px-16 z-10 bg-luxury-black overflow-hidden flex items-center min-h-[70vh]">
        
        {/* Subtle moving ambient radial light sweeps */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-gold-text/5 to-transparent rounded-full filter blur-[150px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto w-full text-center relative z-10 space-y-10">
          
          {/* Triple-Orbit CAD axes locator - Interactive with scroll */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer orbit: rotating clockwise with scroll */}
              <div 
                className="absolute w-28 h-28 border border-dashed border-gold-text/30 rounded-full flex items-center justify-center"
                style={{ transform: `rotate(${scrollY * 0.14}deg)`, transition: 'transform 0.1s ease-out' }}
              >
                <div className="absolute w-1.5 h-1.5 rounded-full bg-gold-text -top-1" />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-gold-text/40 -bottom-1" />
              </div>

              {/* Middle orbit: rotating counter-clockwise with scroll */}
              <div 
                className="absolute w-22 h-22 border border-double border-white/10 rounded-full flex items-center justify-center"
                style={{ transform: `rotate(${-scrollY * 0.24}deg)`, transition: 'transform 0.1s ease-out' }}
              >
                {/* Visual architectural crosshairs */}
                <div className="absolute w-[1px] h-full bg-white/5 top-0 left-1/2 -translate-x-1/2" />
                <div className="absolute h-[1px] w-full bg-white/5 left-0 top-1/2 -translate-y-1/2" />
                <div className="absolute top-1 text-[7px] font-mono text-gold-muted/50 tracking-widest">N</div>
                <div className="absolute right-1 text-[7px] font-mono text-gold-muted/50 tracking-widest">E</div>
                <div className="absolute bottom-1 text-[7px] font-mono text-gold-muted/50 tracking-widest">S</div>
                <div className="absolute left-1 text-[7px] font-mono text-gold-muted/50 tracking-widest">W</div>
              </div>

              {/* Inner core with Compass icon pulsing softly */}
              <div 
                className="absolute w-14 h-14 bg-white/5 border border-gold-text/40 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                style={{ transform: `rotate(${scrollY * 0.05}deg)`, transition: 'transform 0.1s ease-out' }}
              >
                <Compass className="w-5 h-5 text-gold-text animate-pulse" />
              </div>
            </div>

            {/* Micro CAD Telemetry Output */}
            <div className="font-mono text-[8px] text-gold-text/80 uppercase tracking-[0.3em] flex space-x-4">
              <span>BEARING // AZM_{(scrollY % 360).toFixed(1)}°</span>
              <span>ALTITUDE // {(32.5 + scrollY * 0.035).toFixed(2)}m</span>
            </div>
          </div>

          <span className="manifesto-fade-item font-mono text-[9px] text-gold-text tracking-[0.4em] uppercase block">
            ATELIER PHILOSOPHY
          </span>

          {/* Large Editorial Manifesto Quote */}
          <blockquote className="space-y-6">
            <p className="manifesto-letter-reveal font-serif text-3xl md:text-5xl tracking-normal text-f7f5f0 uppercase font-light leading-snug">
              &ldquo;Space is silence. <br />
              Design is the geometry <br />
              we overlay to make <br />
              <span className="text-gold-text">that silence speak.</span>&rdquo;
            </p>
            
            <cite className="manifesto-fade-item block font-mono text-xs text-gold-muted uppercase tracking-widest mt-6 not-italic">
              — Elena Rostova, Founder & Principal Director
            </cite>
          </blockquote>

          <div className="manifesto-fade-item w-12 h-[1px] bg-white/10 mx-auto" />

          <p className="manifesto-fade-item max-w-xl mx-auto text-f7f5f0/60 text-xs md:text-sm tracking-wide leading-relaxed font-light">
            By mapping raw architectural alignments, fluid basalt textures, and kinetic lighting, our physical structures in Europe, Asia, and North America act as volumetric masterpieces of light.
          </p>
          
          {/* Subtle spinning geographic coordinates */}
          <div className="manifesto-fade-item pt-8 flex justify-center gap-10 font-mono text-[8px] text-gold-muted/40 uppercase">
            <span>GRID_SYSTEM_MILANO: CH_REF // 01</span>
            <span>BEARING_VECT_W: AZM_09°</span>
          </div>

        </div>
      </section>

    </div>
  );
}
