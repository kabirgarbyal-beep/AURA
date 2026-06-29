import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ProcessMilestone } from '../types';
import { CheckCircle } from 'lucide-react';
import * as THREE from 'three';

const milestones: ProcessMilestone[] = [
  {
    step: '01',
    title: 'Discovery & Alignment',
    description: 'A structural exploration where we study natural shadows, wind alignments, and material palettes with the client.',
    details: ['Volumetric spatial audits', 'Diurnal sun angle modeling', 'Atmospheric sketch boarding']
  },
  {
    step: '02',
    title: 'Drafting & Blueprints',
    description: 'We draft exact engineering models, casting specifications, and custom CAD elevation layers.',
    details: ['Structural vector layout compilation', 'Marble stone pattern selection', 'Acoustic resonance testing']
  },
  {
    step: '03',
    title: 'Material Alchemy',
    description: 'Procuring bespoke materials: White Carrara marble, gold-veined basalt, matte-black brass, and cedar logs directly from sustainable quarries.',
    details: ['Slab carving inspection', 'Bronze profiling formulation', 'Custom glass transmittance tests']
  },
  {
    step: '04',
    title: 'Spatial Execution',
    description: 'Our certified builders erect raw concrete slabs, embed invisible light paths, and install floating floor profiles.',
    details: ['Raw casting inspection', 'Recessed light layout mapping', 'Panel tolerance verification']
  },
  {
    step: '05',
    title: 'Atmospheric Handover',
    description: 'Final calibration of ambient acoustics, sunset lighting timers, and marble polishing for a pristine hand-over.',
    details: ['Lux spectrum calibration', 'Acoustic decay test', 'Bespoke custom commissioning stamp']
  }
];

export default function ProcessView() {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rebuildSceneRef = useRef<((idx: number) => void) | null>(null);

  useEffect(() => {
    // Fade-in animation for process view texts
    gsap.fromTo('.process-fade-item',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: 'power3.out' }
    );
  }, [activeStepIdx]);

  // Set up 3D WebGL Blueprint Space Viewport using Three.js
  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!canvas || !canvasContainer) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    let width = canvasContainer.clientWidth;
    let height = canvasContainer.clientHeight;

    // 1. Core WebGL Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Group to hold all dynamic architectural coordinates
    const blueprintGroup = new THREE.Group();
    scene.add(blueprintGroup);

    // Grid helper on floor
    const gridHelper = new THREE.GridHelper(8, 20, 0xc5a880, 0x1a1a1a);
    gridHelper.position.y = -0.85;
    if (Array.isArray(gridHelper.material)) {
      gridHelper.material.forEach(m => {
        m.transparent = true;
        m.opacity = 0.25;
      });
    } else {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.25;
    }
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
      opacity: 0.35
    });

    const matSolidFloor = new THREE.MeshBasicMaterial({
      color: 0x121212,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });

    const matSphere = new THREE.MeshBasicMaterial({ color: 0xc5a880 });

    const createWireframeBox = (w: number, h: number, d: number, material: THREE.LineBasicMaterial) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, material);
      geo.dispose();
      return line;
    };

    const createWireframeCylinder = (rt: number, rb: number, h: number, seg: number, material: THREE.LineBasicMaterial) => {
      const geo = new THREE.CylinderGeometry(rt, rb, h, seg);
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, material);
      geo.dispose();
      return line;
    };

    // Reconstruct 3D wireframe objects based on selected blueprint milestone step
    const buildBlueprintStructure = (stepIdx: number) => {
      // Memory cleanup: Clear previous step meshes
      while (blueprintGroup.children.length > 0) {
        const obj = blueprintGroup.children[0];
        blueprintGroup.remove(obj);
        if ((obj as any).geometry) {
          (obj as any).geometry.dispose();
        }
      }

      // ----------------- MILESTONE 1: Discovery & Alignment -----------------
      if (stepIdx === 0) {
        // Flat ground slab
        const floor = createWireframeBox(2.8, 0.05, 2.8, matMutedWireframe);
        floor.position.y = -0.8;
        blueprintGroup.add(floor);

        // Orbital celestial ring (Gold, angled)
        const ringGeo = new THREE.RingGeometry(1.6, 1.62, 64);
        const ringEdges = new THREE.EdgesGeometry(ringGeo);
        const sunOrbit = new THREE.LineSegments(ringEdges, matGoldWireframe);
        sunOrbit.rotation.x = Math.PI / 3;
        sunOrbit.rotation.y = Math.PI / 6;
        sunOrbit.position.set(0, 0, 0);
        blueprintGroup.add(sunOrbit);
        ringGeo.dispose();
        ringEdges.dispose();

        // Orbiting sun sphere
        const sun = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), matSphere);
        sun.name = "sunSphere";
        blueprintGroup.add(sun);

        // Dynamic alignment ray vector
        const rayGeo = new THREE.BufferGeometry();
        const rayLine = new THREE.Line(rayGeo, matWhiteWireframe);
        rayLine.name = "sunRayLine";
        blueprintGroup.add(rayLine);
      }

      // ----------------- MILESTONE 2: Drafting & Blueprints -----------------
      else if (stepIdx === 1) {
        // Multi-layered floorplan drafts floating in space
        const numLayers = 3;
        for (let i = 0; i < numLayers; i++) {
          const layerGroup = new THREE.Group();
          layerGroup.position.y = -0.7 + i * 0.75;

          // Outer sheet boundary wireframe
          const box = createWireframeBox(2.4, 0.02, 2.4, i === 1 ? matGoldWireframe : matWhiteWireframe);
          layerGroup.add(box);

          // Internal CAD drafts line segment arrays
          const innerLineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-1, 0, -1), new THREE.Vector3(1, 0, 1),
            new THREE.Vector3(-1, 0, 1), new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(0, 0, -1.2), new THREE.Vector3(0, 0, 1.2),
            new THREE.Vector3(-1.2, 0, 0), new THREE.Vector3(1.2, 0, 0)
          ]);
          const innerLines = new THREE.LineSegments(innerLineGeo, matMutedWireframe);
          layerGroup.add(innerLines);

          if (!prefersReducedMotion) {
            layerGroup.scale.set(0.01, 1, 0.01);
            gsap.to(layerGroup.scale, { x: 1, z: 1, duration: 0.8 + i * 0.15, ease: 'power2.out' });
          }
          blueprintGroup.add(layerGroup);
        }

        // Vertical aligning guidelines connecting the sheets
        const vPoints = [
          [-1, -1], [1, 1], [-1, 1], [1, -1]
        ];
        vPoints.forEach(([x, z]) => {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, -0.7, z),
            new THREE.Vector3(x, 0.8, z)
          ]);
          const verticalLine = new THREE.Line(lineGeo, matMutedWireframe);
          blueprintGroup.add(verticalLine);
        });
      }

      // ----------------- MILESTONE 3: Material Alchemy -----------------
      else if (stepIdx === 2) {
        // Faceted crystal enclosure representing material composition rules
        const enclosure = createWireframeCylinder(1.2, 1.2, 1.8, 6, matMutedWireframe);
        enclosure.position.y = 0;
        blueprintGroup.add(enclosure);

        // Rotating Core groups showing premium materials (bronze profiles, marble slabs)
        const materialCore = new THREE.Group();
        materialCore.name = "materialCore";

        // Bronze structural rod wireframe
        const bronzeBeam = createWireframeCylinder(0.12, 0.12, 1.4, 6, matGoldWireframe);
        bronzeBeam.position.set(-0.4, 0, -0.4);
        bronzeBeam.rotation.x = Math.PI / 4;
        materialCore.add(bronzeBeam);

        // Marble solid-looking wireframe slab
        const marbleSlab = createWireframeBox(0.8, 1.2, 0.15, matWhiteWireframe);
        marbleSlab.position.set(0.3, 0, 0.3);
        marbleSlab.rotation.y = Math.PI / 6;
        materialCore.add(marbleSlab);

        // Core atom sphere
        const centerCore = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), matSphere);
        centerCore.position.set(0, 0, 0);
        materialCore.add(centerCore);

        if (!prefersReducedMotion) {
          materialCore.scale.set(0.01, 0.01, 0.01);
          gsap.to(materialCore.scale, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'back.out(1.4)' });
        }
        blueprintGroup.add(materialCore);
      }

      // ----------------- MILESTONE 4: Spatial Execution -----------------
      else if (stepIdx === 3) {
        // Base plinth
        const ground = createWireframeBox(2.8, 0.1, 2.8, matWhiteWireframe);
        ground.position.y = -0.8;
        blueprintGroup.add(ground);

        // Structural Columns rising
        const columnPositions = [
          [-1.0, -1.0], [1.0, -1.0], [-1.0, 1.0], [1.0, 1.0]
        ];
        columnPositions.forEach(([x, z], index) => {
          const colGroup = new THREE.Group();
          colGroup.position.set(x, -0.75, z);

          const col = createWireframeCylinder(0.08, 0.08, 1.6, 6, matGoldWireframe);
          col.position.y = 0.8;
          colGroup.add(col);

          if (!prefersReducedMotion) {
            colGroup.scale.y = 0.01;
            gsap.to(colGroup.scale, { y: 1, duration: 1.0, delay: index * 0.15, ease: 'power3.out' });
          }
          blueprintGroup.add(colGroup);
        });

        // Sliding roof slab representing floating floor profiles assembly
        const roof = createWireframeBox(3.0, 0.1, 3.0, matMutedWireframe);
        roof.name = "execRoof";
        if (!prefersReducedMotion) {
          roof.position.set(0, 3.0, 0);
          gsap.to(roof.position, { y: 0.85, duration: 1.4, delay: 0.6, ease: 'power2.out' });
        } else {
          roof.position.set(0, 0.85, 0);
        }
        blueprintGroup.add(roof);
      }

      // ----------------- MILESTONE 5: Atmospheric Handover -----------------
      else if (stepIdx === 4) {
        // Complete structural room framework
        const ground = createWireframeBox(2.8, 0.08, 2.8, matWhiteWireframe);
        ground.position.y = -0.8;
        blueprintGroup.add(ground);

        const roof = createWireframeBox(3.0, 0.08, 3.0, matWhiteWireframe);
        roof.position.y = 0.8;
        blueprintGroup.add(roof);

        const pillarPositions = [
          [-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]
        ];
        pillarPositions.forEach(([x, z]) => {
          const col = createWireframeCylinder(0.05, 0.05, 1.6, 6, matMutedWireframe);
          col.position.set(x, 0, z);
          blueprintGroup.add(col);
        });

        // Acoustical Sound Ripples expanding outwards
        const waveGroup = new THREE.Group();
        waveGroup.name = "acousticWaves";
        blueprintGroup.add(waveGroup);

        const numRings = 2;
        for (let i = 0; i < numRings; i++) {
          const ringGeo = new THREE.RingGeometry(0.1, 0.12, 32);
          const matRing = new THREE.MeshBasicMaterial({
            color: 0xc5a880,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
          });
          const ring = new THREE.Mesh(ringGeo, matRing);
          ring.rotation.x = Math.PI / 2;
          ring.position.set(0, -0.75, 0);
          waveGroup.add(ring);

          if (!prefersReducedMotion) {
            gsap.fromTo(ring.scale,
              { x: 0.1, y: 0.1, z: 0.1 },
              {
                x: 18.0,
                y: 18.0,
                z: 18.0,
                duration: 2.5,
                delay: i * 1.25,
                repeat: -1,
                ease: 'power1.out'
              }
            );
            gsap.fromTo(matRing,
              { opacity: 0.6 },
              {
                opacity: 0.0,
                duration: 2.5,
                delay: i * 1.25,
                repeat: -1,
                ease: 'power1.out'
              }
            );
          } else {
            ring.scale.set(12 + i * 6, 12 + i * 6, 1);
            matRing.opacity = 0.25;
          }
        }

        // Floating Lux particles (stardust light calibration simulation)
        const particleCount = 20;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 2.2;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 1.4;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
          color: 0xfff3e0,
          size: 0.05,
          transparent: true,
          opacity: 0.6
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        particles.name = "luxParticles";
        blueprintGroup.add(particles);
      }
    };

    // Assign reference so we can sync step switches dynamically
    rebuildSceneRef.current = buildBlueprintStructure;

    // Construct initial blueprint step structure
    buildBlueprintStructure(activeStepIdx);

    // Basic soft lighting setup
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

    // Intersection visibility check for frame rate management
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

    // Render loop containing math-based wireframe rotations
    let animationFrameId: number;
    let angle = 0;

    const animate = () => {
      if (!isElementVisible) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      angle += prefersReducedMotion ? 0.0006 : 0.0025;

      // Smooth slow camera orbit paths around standard target center
      camera.position.x = Math.sin(angle) * 4.8;
      camera.position.z = Math.cos(angle) * 4.8;
      camera.position.y = 1.6 + Math.sin(angle * 0.4) * 0.25;
      camera.lookAt(0, 0, 0);

      // Rotate blueprint coordinates slightly for geometric elegance
      if (blueprintGroup) {
        blueprintGroup.rotation.y = Math.sin(angle * 0.15) * 0.05;

        // 1. Discovery & Alignment celestial path calculations
        const sun = blueprintGroup.getObjectByName("sunSphere");
        const rayLine = blueprintGroup.getObjectByName("sunRayLine");
        if (sun) {
          const sunAngle = angle * 2.0;
          const r = 1.6;
          // Local circle coordinates
          const lx = Math.sin(sunAngle) * r;
          const lz = Math.cos(sunAngle) * r;
          const ly = 0;

          // Rotation matrices: X-axis rotation PI/3, Y-axis rotation PI/6
          const cosX = Math.cos(Math.PI / 3);
          const sinX = Math.sin(Math.PI / 3);
          const cosY = Math.cos(Math.PI / 6);
          const sinY = Math.sin(Math.PI / 6);

          const y1 = ly * cosX - lz * sinX;
          const z1 = ly * sinX + lz * cosX;

          const x2 = lx * cosY + z1 * sinY;
          const z2 = -lx * sinY + z1 * cosY;

          sun.position.set(x2, y1, z2);

          // Update connection line
          if (rayLine) {
            const points = [
              new THREE.Vector3(x2, y1, z2),
              new THREE.Vector3(0, -0.8, 0)
            ];
            (rayLine as THREE.Line).geometry.setFromPoints(points);
          }
        }

        // 3. Material Alchemy rotating Core objects
        const materialCore = blueprintGroup.getObjectByName("materialCore");
        if (materialCore) {
          materialCore.rotation.y = angle * 1.5;
          materialCore.rotation.x = Math.sin(angle * 0.5) * 0.2;
        }

        // 5. Atmospheric Handover slow particles drift
        const luxParticles = blueprintGroup.getObjectByName("luxParticles");
        if (luxParticles && !prefersReducedMotion) {
          const posAttr = (luxParticles as THREE.Points).geometry.attributes.position;
          const arr = posAttr.array as Float32Array;
          for (let i = 0; i < arr.length; i += 3) {
            arr[i + 1] += 0.002;
            if (arr[i + 1] > 0.8) {
              arr[i + 1] = -0.7; // recycle at ground level
            }
          }
          posAttr.needsUpdate = true;
        }
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

      // Memory leak protection: release WebGL resources
      renderer.dispose();
      matGoldWireframe.dispose();
      matWhiteWireframe.dispose();
      matMutedWireframe.dispose();
      matSolidFloor.dispose();
      matSphere.dispose();
      gridHelper.geometry.dispose();
      if (Array.isArray(gridHelper.material)) {
        gridHelper.material.forEach(m => m.dispose());
      } else {
        gridHelper.material.dispose();
      }
    };
  }, []);

  // Sync state changes into Three.js timeline instantly
  useEffect(() => {
    if (rebuildSceneRef.current) {
      rebuildSceneRef.current(activeStepIdx);
    }
  }, [activeStepIdx]);

  return (
    <div className="w-full bg-luxury-black text-f7f5f0 py-24 px-6 md:px-12 relative min-h-screen flex flex-col justify-between">
      {/* Blueprint Grid Overlay in background */}
      <div className="absolute inset-0 blueprint-grid z-0 opacity-20 pointer-events-none" />

      {/* Decorative Technical Margins */}
      <div className="absolute top-24 left-12 text-[10px] font-mono text-gold-muted/40 uppercase">SEC. PROCESS // BLUEPRINT SCHEMES</div>
      <div className="absolute top-24 right-12 text-[10px] font-mono text-gold-muted/40 uppercase">PAGE // 05_OF_07</div>

      {/* Process Header */}
      <div className="max-w-6xl mx-auto pt-12 relative z-10 mb-16 text-center">
        <span className="font-mono text-[10px] text-gold-text tracking-[0.4em] uppercase block mb-3">
          CHOREOGRAPHED EXECUTION
        </span>
        <h1 className="font-serif text-4xl md:text-6xl tracking-tight uppercase font-light leading-none mb-6">
          The Crafting Blueprint
        </h1>
        <p className="max-w-xl mx-auto text-f7f5f0/60 text-xs md:text-sm tracking-wide leading-relaxed font-light">
          We convert raw ideas into high-end structural realities. Walk through our five choreographed steps of architectural creation.
        </p>
      </div>

      {/* Main Process Interactive Area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 items-stretch mb-20 w-full">
        
        {/* Left Side: Interactive Milestones Road */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="font-mono text-[9px] text-gold-text tracking-[0.2em] uppercase block mb-2">
              MILESTONE STEP LIST
            </span>

            {milestones.map((milestone, idx) => {
              const isActive = idx === activeStepIdx;
              const isPast = idx < activeStepIdx;
              return (
                <button
                  key={milestone.step}
                  onClick={() => setActiveStepIdx(idx)}
                  className={`w-full text-left p-6 border transition-all duration-500 relative flex items-center justify-between hover-target ${
                    isActive 
                      ? 'border-gold-text bg-gold-text/5' 
                      : 'border-white/5 bg-luxury-gray/40 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    <span className={`font-mono text-xs tracking-widest ${isActive ? 'text-gold-text' : 'text-gold-muted/40'}`}>
                      {milestone.step} //
                    </span>
                    <h3 className={`font-serif text-lg tracking-wide uppercase transition-colors duration-300 ${
                      isActive ? 'text-gold-text font-medium' : 'text-f7f5f0/70'
                    }`}>
                      {milestone.title}
                    </h3>
                  </div>

                  {/* Icon states */}
                  <div className="flex items-center space-x-2">
                    {isPast && <CheckCircle className="w-4 h-4 text-gold-text opacity-60" />}
                    {isActive && <div className="w-2 h-2 bg-gold-text rounded-full animate-ping" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep Description block of selected milestone */}
          <div className="glass-panel border border-white/5 p-8 relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-text to-transparent" />
            <span className="font-mono text-[9px] text-gold-text tracking-[0.3em] uppercase block mb-1">
              CHAMBER PHASE SPECIFICATIONS
            </span>
            <h3 className="font-serif text-2xl text-f7f5f0 uppercase mb-4">
              {milestones[activeStepIdx].title}
            </h3>
            <p className="text-f7f5f0/70 text-xs md:text-sm font-light leading-relaxed mb-6">
              {milestones[activeStepIdx].description}
            </p>

            <span className="font-mono text-[9px] text-gold-muted tracking-[0.2em] uppercase block mb-3 border-b border-white/5 pb-1">
              CRAFT SUB-TASKS
            </span>
            <ul className="space-y-2">
              {milestones[activeStepIdx].details.map((detail, index) => (
                <li key={index} className="flex items-center space-x-3 text-xs text-f7f5f0/80 font-light">
                  <span className="w-1.5 h-1.5 bg-gold-text rounded-full" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Elegant 3D WebGL Drafting Canvas */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-between space-y-6">
          <div 
            ref={canvasContainerRef}
            className="w-full h-[350px] lg:h-full min-h-[400px] bg-luxury-gray/20 border border-white/5 relative flex items-center justify-center overflow-hidden"
          >
            {/* Visual technical markings overlay */}
            <div className="absolute top-4 left-4 font-mono text-[9px] text-gold-text/50 uppercase">RENDER_MODE: REALTIME_CONSTRUCT</div>
            <div className="absolute top-4 right-4 font-mono text-[9px] text-gold-text/50 uppercase">REF_SYS: THREE_JS_V3D</div>
            
            <div className="absolute bottom-4 left-4 font-mono text-[8px] text-gold-muted/40">
              AXIS_X: {Math.sin(activeStepIdx).toFixed(2)} // AXIS_Y: {Math.cos(activeStepIdx).toFixed(2)}
            </div>

            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* Absolute Fallback/Loading element */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-transparent">
              <span className="font-mono text-[8px] text-gold-muted/40 tracking-[0.25em] uppercase">
                Constructing Space {milestones[activeStepIdx].step} ...
              </span>
            </div>
          </div>

          {/* WebGL Blueprint Explanatory Block */}
          <div className="p-6 border border-white/5 bg-luxury-gray/10 backdrop-blur-md relative overflow-hidden rounded-none">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-text/30 to-transparent" />
            <span className="font-mono text-[9px] text-gold-text tracking-[0.3em] uppercase block mb-2">
              Blueprint Simulation // Atmospheric Choreography
            </span>
            <h4 className="font-serif text-sm uppercase text-f7f5f0 mb-3 flex items-center space-x-2">
              <span className="inline-block w-1.5 h-1.5 bg-gold-text rounded-full animate-pulse" />
              <span>What is this blueprint displaying?</span>
            </h4>
            
            <p className="text-xs text-f7f5f0/70 leading-relaxed font-light">
              {activeStepIdx === 0 && (
                "Our real-time Alignment simulator models a diurnal celestial ring. The glowing gold orbit simulates the local solar trajectory above a proposed plot, calculating precise shadow matrices and window alignments to harness natural light."
              )}
              {activeStepIdx === 1 && (
                "This layered drafting system renders three-dimensional CAD slices floating in space. Vertical alignment grids and coordinate vectors demonstrate structural continuity across multiple elevations and structural planes."
              )}
              {activeStepIdx === 2 && (
                "Material Alchemy explores texture compositions. Here, an abstract block representing Carrara marble and sustainable bronze beam profiles is tested inside a rotating wireframe containment grid, analyzing density and light refraction values."
              )}
              {activeStepIdx === 3 && (
                "The Spatial Execution construct visualizes actual column raising. It models key foundational load-bearing points and tracks horizontal concrete slab elevations as they assemble onto the finished concrete plinth."
              )}
              {activeStepIdx === 4 && (
                "A finished, acoustically calibrated architectural sanctuary. Floating lux light particles simulate atmospheric illumination, while expanding concentric wave ripples represent pristine sonic absorption tests within the completed pavilion."
              )}
            </p>
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-gold-muted/50">
              <span>SIMULATOR STATUS: RESOLVED</span>
              <span>PHASE_CODE: CH_{milestones[activeStepIdx].step}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

