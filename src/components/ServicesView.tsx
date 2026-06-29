import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Compass, Lightbulb, Grid, Volume1, ArrowUpRight } from 'lucide-react';
import { ServiceItem } from '../types';

const servicesData: ServiceItem[] = [
  {
    id: 'spatial-architecture',
    title: 'Spatial Architecture',
    tagline: 'Drafting pure volume and structural rhythm',
    description: [
      'We design physical frameworks using modern cantilever calculations and concrete volume castings.',
      'Our structures integrate large double-glazed windows, precise directional skylight openings, and concrete shadow shafts.',
      'We curate sight-lines, ensuring that moving through an estate feels like reading a well-paced story.'
    ],
    color: '#c5a880'
  },
  {
    id: 'bespoke-interiors',
    title: 'Bespoke Interiors',
    tagline: 'Composing material layers and tactile dialogues',
    description: [
      'We select geological stones, brushed dark metals, oiled cedar, and hand-woven silk tapestry.',
      'Every piece of furniture is custom-designed and crafted specifically for the volume, respecting spatial alignments.',
      'We emphasize the fine gaps and reveal-lines between materials to ensure structural honesty.'
    ],
    color: '#8e7d66'
  },
  {
    id: 'lighting-design',
    title: 'Lighting Engineering',
    tagline: 'Modulating warmth, luxury, and visual focal-points',
    description: [
      'We calculate natural light angles and model diurnal shadow maps for each season.',
      'Our team embeds invisible micro-lighting profiles, high-CRI glowing ceiling gaps, and custom bronze fixtures.',
      'We design scenes that transition automatically from crisp daylight to glowing golden twilight.'
    ],
    color: '#bf8950'
  },
  {
    id: 'volumetric-acoustics',
    title: 'Volumetric Acoustics',
    tagline: 'Crafting silence and rich acoustic insulation',
    description: [
      'We engineer silent environments using perforated material cores, hidden micro-absorbing pockets, and soft fabrics.',
      'Our layouts reduce room reverberation to a luxurious, intimate whisper, preventing cold echo noise.',
      'We model sound paths to isolate active sections (media, entertainment) from silent sanctuaries.'
    ],
    color: '#af723b'
  }
];

export default function ServicesView() {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('spatial-architecture');
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References for rendering and lightweight updates without context recreation
  const roomMeshGroupRef = useRef<THREE.Group | null>(null);
  const rebuildSceneRef = useRef<((serviceId: string) => void) | null>(null);

  useEffect(() => {
    // Fade in services headers
    gsap.fromTo('.services-fade-item',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.1, ease: 'power3.out' }
    );
  }, []);

  // WebGL single-init effect
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!canvasContainer || !canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#080808', 0.08);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(3.8, 2.8, 4.8);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Group to hold construction elements
    const roomGroup = new THREE.Group();
    scene.add(roomGroup);
    roomMeshGroupRef.current = roomGroup;

    // Grid floor helper representing blueprint
    const gridHelper = new THREE.GridHelper(4.5, 12, 0xc5a880, 0x222222);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // High-visibility premium materials
    const matGoldWireframe = new THREE.LineBasicMaterial({ 
      color: 0xc5a880, 
      transparent: true,
      opacity: 0.75
    });

    const matWhiteWireframe = new THREE.LineBasicMaterial({ 
      color: 0xf7f5f0, 
      transparent: true,
      opacity: 0.5
    });

    const matMutedWireframe = new THREE.LineBasicMaterial({ 
      color: 0x444444, 
      transparent: true,
      opacity: 0.4
    });

    const matSolidFloor = new THREE.MeshBasicMaterial({
      color: 0x121212,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });

    const matLightTube = new THREE.MeshBasicMaterial({ color: 0xfff3e0 });
    const matSphere = new THREE.MeshBasicMaterial({ color: 0xc5a880 });

    const createWireframeBox = (width: number, height: number, depth: number, material: THREE.LineBasicMaterial) => {
      const geo = new THREE.BoxGeometry(width, height, depth);
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, material);
      geo.dispose();
      return line;
    };

    const createWireframeCylinder = (radiusTop: number, radiusBottom: number, height: number, radialSegments: number, material: THREE.LineBasicMaterial) => {
      const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, material);
      geo.dispose();
      return line;
    };

    // Dynamic reconstruction based on selected service ID without destroying the whole WebGL engine!
    const buildWireframeStructure = (serviceId: string) => {
      // Clear old sub-meshes
      while (roomGroup.children.length > 0) {
        const obj = roomGroup.children[0] as THREE.Object3D;
        roomGroup.remove(obj);
        if ((obj as any).geometry) {
          (obj as any).geometry.dispose();
        }
      }

      if (serviceId === 'spatial-architecture') {
        // Base Slab Mesh & Wireframe
        const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 3.2), matSolidFloor);
        baseMesh.position.y = -0.95;
        roomGroup.add(baseMesh);

        const baseWire = createWireframeBox(3.2, 0.1, 3.2, matGoldWireframe);
        baseWire.position.y = -0.95;
        roomGroup.add(baseWire);

        // Pillars (Four columns)
        const pillarPositions = [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]];
        pillarPositions.forEach(([x, z], index) => {
          const pillar = createWireframeCylinder(0.06, 0.06, 1.8, 6, matWhiteWireframe);
          pillar.position.set(x, -0.05, z);
          
          if (!prefersReducedMotion) {
            pillar.scale.y = 0.01;
            gsap.to(pillar.scale, { y: 1, duration: 0.8 + index * 0.1, ease: 'power2.out' });
          }
          roomGroup.add(pillar);

          // Technical guide line extending upwards from each pillar
          const guideGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, 0.85, z),
            new THREE.Vector3(x, 1.8, z)
          ]);
          const guideLine = new THREE.Line(guideGeo, matMutedWireframe);
          roomGroup.add(guideLine);
        });

        // Cantilever Roof Slab
        const roof = createWireframeBox(3.6, 0.12, 3.6, matGoldWireframe);
        if (prefersReducedMotion) {
          roof.position.set(0.1, 0.95, 0);
        } else {
          roof.position.set(0.1, 2.5, 0);
          gsap.to(roof.position, { y: 0.95, duration: 1.0, ease: 'power3.out' });
        }
        roomGroup.add(roof);

        // Architectural wall partitions
        const wall1 = createWireframeBox(0.02, 1.8, 1.3, matWhiteWireframe);
        wall1.position.set(-1.3, -0.05, 0);
        if (!prefersReducedMotion) {
          wall1.scale.y = 0.01;
          gsap.to(wall1.scale, { y: 1, duration: 0.8, delay: 0.2, ease: 'power2.out' });
        }
        roomGroup.add(wall1);

        const wall2 = createWireframeBox(1.2, 1.8, 0.02, matWhiteWireframe);
        wall2.position.set(0.4, -0.05, -1.3);
        if (!prefersReducedMotion) {
          wall2.scale.y = 0.01;
          gsap.to(wall2.scale, { y: 1, duration: 0.8, delay: 0.3, ease: 'power2.out' });
        }
        roomGroup.add(wall2);
      }

      if (serviceId === 'bespoke-interiors') {
        // Base Slab & Frame
        const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 3.2), matSolidFloor);
        baseMesh.position.y = -0.95;
        roomGroup.add(baseMesh);

        const baseWire = createWireframeBox(3.2, 0.1, 3.2, matMutedWireframe);
        baseWire.position.y = -0.95;
        roomGroup.add(baseWire);

        // Thin accent pillars
        const pillarPositions = [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]];
        pillarPositions.forEach(([x, z]) => {
          const pillar = createWireframeCylinder(0.02, 0.02, 1.8, 4, matMutedWireframe);
          pillar.position.set(x, -0.05, z);
          roomGroup.add(pillar);
        });

        // Couch (Bespoke Sofa)
        const sofaGroup = new THREE.Group();
        
        const cushion = createWireframeBox(1.6, 0.3, 0.7, matGoldWireframe);
        cushion.position.set(0, -0.75, 0.2);
        sofaGroup.add(cushion);

        const backrest = createWireframeBox(1.6, 0.4, 0.2, matGoldWireframe);
        backrest.position.set(0, -0.45, -0.05);
        sofaGroup.add(backrest);

        const armLeft = createWireframeBox(0.2, 0.45, 0.7, matGoldWireframe);
        armLeft.position.set(-0.9, -0.675, 0.2);
        sofaGroup.add(armLeft);

        const armRight = createWireframeBox(0.2, 0.45, 0.7, matGoldWireframe);
        armRight.position.set(0.9, -0.675, 0.2);
        sofaGroup.add(armRight);

        if (!prefersReducedMotion) {
          sofaGroup.scale.set(0.01, 0.01, 0.01);
          gsap.to(sofaGroup.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.2)' });
        }
        roomGroup.add(sofaGroup);

        // Coffee Table
        const table = createWireframeBox(0.8, 0.15, 0.5, matWhiteWireframe);
        table.position.set(0, -0.85, -0.5);
        if (!prefersReducedMotion) {
          table.scale.set(0.01, 0.01, 0.01);
          gsap.to(table.scale, { x: 1, y: 1, z: 1, duration: 0.8, delay: 0.2, ease: 'power2.out' });
        }
        roomGroup.add(table);

        // Designer Floor Lamp
        const lampGroup = new THREE.Group();
        const lampPole = createWireframeCylinder(0.01, 0.01, 1.4, 4, matWhiteWireframe);
        lampPole.position.set(-1.0, -0.25, -0.8);
        lampGroup.add(lampPole);

        const lampShade = createWireframeCylinder(0.12, 0.16, 0.15, 6, matGoldWireframe);
        lampShade.position.set(-1.0, 0.45, -0.8);
        lampGroup.add(lampShade);

        const lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), matSphere);
        lampBulb.position.set(-1.0, 0.42, -0.8);
        lampGroup.add(lampBulb);

        if (!prefersReducedMotion) {
          lampGroup.position.y = -1;
          gsap.to(lampGroup.position, { y: 0, duration: 1.0, delay: 0.3, ease: 'power2.out' });
        }
        roomGroup.add(lampGroup);
      }

      if (serviceId === 'lighting-design') {
        // Base Slab & Pillars
        const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 3.2), matSolidFloor);
        baseMesh.position.y = -0.95;
        roomGroup.add(baseMesh);

        const baseWire = createWireframeBox(3.2, 0.1, 3.2, matMutedWireframe);
        baseWire.position.y = -0.95;
        roomGroup.add(baseWire);

        const pillarPositions = [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]];
        pillarPositions.forEach(([x, z]) => {
          const pillar = createWireframeCylinder(0.02, 0.02, 1.8, 4, matMutedWireframe);
          pillar.position.set(x, -0.05, z);
          roomGroup.add(pillar);
        });

        // Suspended Custom Lighting Tube
        const lightTubeGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.0, 8);
        const lightTube = new THREE.Mesh(lightTubeGeo, matLightTube);
        lightTube.rotation.z = Math.PI / 2;
        lightTube.position.set(0, 0.8, 0);
        roomGroup.add(lightTube);

        // Central Glowing Core
        const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const sphere = new THREE.Mesh(sphereGeo, matSphere);
        sphere.position.set(0, 0.8, 0);
        roomGroup.add(sphere);

        // Dynamic light rays branching out to floor
        const rayTargets = [
          [-1.0, -0.9, -1.0],
          [1.0, -0.9, -1.0],
          [-1.0, -0.9, 1.0],
          [0.0, -0.9, 1.2],
          [0.8, -0.9, 0.5],
          [-0.6, -0.9, 0.2]
        ];

        rayTargets.forEach((target, index) => {
          const rayGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.8, 0),
            new THREE.Vector3(target[0], target[1], target[2])
          ]);
          
          const matRay = new THREE.LineBasicMaterial({
            color: 0xffe0b2,
            transparent: true,
            opacity: 0.0
          });
          const rayLine = new THREE.Line(rayGeo, matRay);
          roomGroup.add(rayLine);

          if (!prefersReducedMotion) {
            gsap.to(matRay, {
              opacity: 0.45,
              duration: 0.6,
              delay: index * 0.1,
              repeat: -1,
              yoyo: true,
              ease: 'power1.inOut'
            });
          } else {
            matRay.opacity = 0.3;
          }
        });
      }

      if (serviceId === 'volumetric-acoustics') {
        // Base Slab & Pillars
        const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 3.2), matSolidFloor);
        baseMesh.position.y = -0.95;
        roomGroup.add(baseMesh);

        const baseWire = createWireframeBox(3.2, 0.1, 3.2, matMutedWireframe);
        baseWire.position.y = -0.95;
        roomGroup.add(baseWire);

        const pillarPositions = [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]];
        pillarPositions.forEach(([x, z]) => {
          const pillar = createWireframeCylinder(0.02, 0.02, 1.8, 4, matMutedWireframe);
          pillar.position.set(x, -0.05, z);
          roomGroup.add(pillar);
        });

        // Acoustic Perforated Panels on side walls
        const panelGeo = new THREE.BoxGeometry(0.5, 1.2, 0.03);
        const panelPositions = [-0.6, 0.0, 0.6];
        panelPositions.forEach((zOffset, index) => {
          const panel = new THREE.Mesh(panelGeo, matSolidFloor);
          panel.rotation.y = Math.PI / 2;
          panel.position.set(-1.28, 0.0, zOffset);
          roomGroup.add(panel);

          const panelWire = createWireframeBox(0.5, 1.2, 0.03, matGoldWireframe);
          panelWire.rotation.y = Math.PI / 2;
          panelWire.position.set(-1.28, 0.0, zOffset);
          
          if (!prefersReducedMotion) {
            panelWire.position.x = -2.5;
            gsap.to(panelWire.position, { x: -1.28, duration: 0.8, delay: index * 0.1, ease: 'power2.out' });
          }
          roomGroup.add(panelWire);
        });

        // Central acoustic emitter source sphere
        const emitter = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), matSphere);
        emitter.position.set(0, -0.2, 0);
        roomGroup.add(emitter);

        // Soundwave ripple rings
        const numRings = 3;
        for (let i = 0; i < numRings; i++) {
          const ringGeo = new THREE.RingGeometry(0.1, 0.12, 32);
          const matRing = new THREE.MeshBasicMaterial({
            color: 0xc5a880,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
          });
          const ring = new THREE.Mesh(ringGeo, matRing);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(0, -0.2, 0);
          roomGroup.add(ring);

          if (!prefersReducedMotion) {
            // Animate concentric expansion
            gsap.fromTo(ring.scale,
              { x: 0.1, y: 0.1, z: 0.1 },
              {
                x: 22.0,
                y: 22.0,
                z: 22.0,
                duration: 2.4,
                delay: i * 0.8,
                repeat: -1,
                ease: 'power1.out'
              }
            );
            gsap.fromTo(matRing,
              { opacity: 0.8 },
              {
                opacity: 0.0,
                duration: 2.4,
                delay: i * 0.8,
                repeat: -1,
                ease: 'power1.out'
              }
            );
          } else {
            ring.scale.set(10 + i * 5, 10 + i * 5, 1);
            matRing.opacity = 0.2;
          }
        }
      }
    };

    // Assign rebuilding reference
    rebuildSceneRef.current = buildWireframeStructure;
    
    // Build initial state
    buildWireframeStructure(selectedServiceId);

    // Basic lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight.position.set(3, 4, 2);
    scene.add(dirLight);

    // Debounced Resize Observer
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

    // Pause rendering when off screen
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

    const handleVisibility = () => {
      isElementVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ANIMATION LOOP (Camera orbiting)
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      if (!isElementVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      angle += prefersReducedMotion ? 0.0008 : 0.0025; // Slow down drastically for prefers-reduced-motion
      
      // Camera orbit paths
      camera.position.x = Math.sin(angle) * 5.0 + 0.5;
      camera.position.z = Math.cos(angle) * 5.0;
      camera.position.y = 2.2 + Math.sin(angle * 0.5) * 0.3;
      camera.lookAt(0, 0, 0);

      // Rotate group slightly
      if (roomGroup) {
        roomGroup.rotation.y = Math.sin(angle * 0.2) * 0.08;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.clearTimeout(resizeTimeout);
      document.removeEventListener('visibilitychange', handleVisibility);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      // Explicit WebGL memory cleanup
      renderer.dispose();
      matGoldWireframe.dispose();
      matWhiteWireframe.dispose();
      matMutedWireframe.dispose();
      matSolidFloor.dispose();
      matLightTube.dispose();
      matSphere.dispose();
      gridHelper.geometry.dispose();
      if (Array.isArray(gridHelper.material)) {
        gridHelper.material.forEach(m => m.dispose());
      } else {
        gridHelper.material.dispose();
      }
    };
  }, []);

  // Sync state switches directly into the existing WebGL graph without reconstruct cycles!
  useEffect(() => {
    if (rebuildSceneRef.current) {
      rebuildSceneRef.current(selectedServiceId);
    }
  }, [selectedServiceId]);

  const activeService = servicesData.find(s => s.id === selectedServiceId) || servicesData[0];

  return (
    <div className="w-full bg-luxury-black text-f7f5f0 py-24 px-6 md:px-12 relative min-h-screen">
      {/* Blueprint Grid Overlay in background */}
      <div className="absolute inset-0 blueprint-grid z-0 opacity-20 pointer-events-none" />

      {/* Decorative Technical Margins */}
      <div className="absolute top-24 left-12 text-[10px] font-mono text-gold-muted/40">SEC. SERVICES // DISCIPLINE MATRICES</div>
      <div className="absolute top-24 right-12 text-[10px] font-mono text-gold-muted/40">PAGE // 04_OF_07</div>

      {/* Services Layout Frame */}
      <div className="max-w-6xl mx-auto pt-12 relative z-10 flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Services List Navigation & Deep Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div className="services-fade-item opacity-0">
            <span className="font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-3">
              WHAT WE COMPILE
            </span>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight uppercase font-light leading-none mb-10">
              Interactive Services
            </h1>

            {/* Vertically Aligned Accordion Buttons with icons */}
            <div className="space-y-4 mb-10">
              {servicesData.map((service, idx) => {
                const isSelected = service.id === selectedServiceId;
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`w-full text-left p-6 border transition-all duration-500 relative flex items-center justify-between hover-target focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold-text ${
                      isSelected 
                        ? 'border-gold-text bg-gold-text/5' 
                        : 'border-white/5 bg-luxury-gray/40 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="font-mono text-xs text-gold-muted tracking-widest">
                        0{idx + 1} //
                      </span>
                      <h3 className={`font-serif text-lg tracking-wide uppercase transition-colors duration-300 ${
                        isSelected ? 'text-gold-text font-medium' : 'text-f7f5f0/80'
                      }`}>
                        {service.title}
                      </h3>
                    </div>
                    <ArrowUpRight className={`w-4 h-4 transition-transform duration-500 ${
                      isSelected ? 'text-gold-text rotate-45 scale-110' : 'text-gold-muted/40'
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded Selected Service Card */}
          <div className="services-fade-item opacity-0 glass-panel border border-white/5 p-8 relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-text to-transparent" />
            <h4 className="font-mono text-[10px] text-gold-text tracking-[0.3em] uppercase mb-1">
              {activeService.tagline}
            </h4>
            <h3 className="font-serif text-2xl text-f7f5f0 uppercase mb-4">
              Overview & Methodology
            </h3>
            
            <div className="space-y-4">
              {activeService.description.map((paragraph, index) => (
                <p key={index} className="text-f7f5f0/70 text-xs md:text-sm font-light leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Immersive 3D Construction Canvas Container */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <div className="services-fade-item opacity-0 text-center mb-4">
            <span className="font-mono text-[9px] tracking-[0.3em] text-gold-muted uppercase">
              [ REAL-TIME WEBGL ] ROOM WIREFRAME CONSTRUCTING ITSELF
            </span>
          </div>

          <div 
            ref={canvasContainerRef}
            className="w-full h-[350px] md:h-[500px] bg-luxury-gray/20 border border-white/5 relative flex items-center justify-center overflow-hidden services-fade-item opacity-0 mb-6"
          >
            {/* Visual technical markings overlay */}
            <div className="absolute top-4 left-4 font-mono text-[9px] text-gold-text/50">RENDER_MODE: WIREFRAME_3D</div>
            <div className="absolute top-4 right-4 font-mono text-[9px] text-gold-text/50">ENGINE: THREE_WEBGL</div>
            <div className="absolute bottom-4 left-4 font-mono text-[9px] text-gold-muted">COORD: SYS.LOC // CHASSIS_09</div>
            
            {/* Real Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />

            {/* Golden glowing status bar */}
            <div className="absolute bottom-4 right-4 bg-luxury-black/80 border border-gold-text/20 px-3 py-1 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-gold-text rounded-full" />
              <span className="font-mono text-[9px] text-gold-text uppercase tracking-widest">
                Compiling Node: {activeService.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* WebGL Simulation Explanatory Block */}
          <div className="services-fade-item opacity-0 p-6 border border-white/5 bg-luxury-gray/10 backdrop-blur-md relative overflow-hidden rounded-none">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-text/30 to-transparent" />
            <span className="font-mono text-[9px] text-gold-text tracking-[0.3em] uppercase block mb-2">
              Simulation Analytics // Volumetric Interpretation
            </span>
            <h4 className="font-serif text-sm uppercase text-f7f5f0 mb-3 flex items-center space-x-2">
              <span className="inline-block w-1.5 h-1.5 bg-gold-text rounded-full animate-pulse" />
              <span>What is this simulation showing or doing?</span>
            </h4>
            
            <p className="text-xs text-f7f5f0/70 leading-relaxed font-light">
              {activeService.id === 'spatial-architecture' && (
                "Our real-time Spatial Architecture simulation drafts an abstract architectural cell in real-time. It projects three-dimensional wireframe vectors representing cantilevered concrete slabs, ceiling grids, support pillars, and precise window alignments. This computational rendering lets our Milanesi design team dynamically analyze spatial depth, vertical proportions, and volumetric balance prior to physical stone and concrete construction."
              )}
              {activeService.id === 'bespoke-interiors' && (
                "This layout visualization maps custom interior volumes. It scales material boundaries—such as geological stone plinths, cedar partition walls, and custom furniture frameworks—to demonstrate how physical coordinates and raw materials dialogue inside the finished architectural canvas."
              )}
              {activeService.id === 'lighting-design' && (
                "The lighting engineering model projects diurnal solar trajectories and artificial light paths. These golden vectors simulate how rays pass through double-glazed skylights and bounce off surfaces, showing how shadow maps and glowing ceiling slots adapt to transition from daytime crispness to a golden evening glow."
              )}
              {activeService.id === 'volumetric-acoustics' && (
                "This acoustical canvas maps invisible acoustic reverberation bounds and wave trajectories. It illustrates how sound waves meet our custom perforated cores and sound-absorbing micro-pockets, showing how physical volumes are engineered to insulate intimate chambers and ensure comfortable, conversational silence."
              )}
            </p>
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gold-muted/50">
              <span>ENGINE STAT: ACTIVE</span>
              <span>NODE: {activeService.id.toUpperCase()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
