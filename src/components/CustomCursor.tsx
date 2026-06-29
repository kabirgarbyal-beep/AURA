import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if device supports touch to completely disable custom cursor on mobile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      if (dotRef.current) dotRef.current.style.display = 'none';
      if (followerRef.current) followerRef.current.style.display = 'none';
      document.documentElement.style.cursor = 'auto';
      return;
    }

    const dot = dotRef.current;
    const follower = followerRef.current;
    if (!dot || !follower) return;

    // Set initial off-screen positions and hide
    gsap.set([dot, follower], { x: -100, y: -100, opacity: 0 });

    // Use highly optimized gsap.quickTo for instant rendering without GC overhead
    const xDotTo = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const yDotTo = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const xFollowerTo = gsap.quickTo(follower, "x", { duration: 0.25, ease: "power3.out" });
    const yFollowerTo = gsap.quickTo(follower, "y", { duration: 0.25, ease: "power3.out" });

    let hasMoved = false;

    // Track mouse position and reveal
    const onMouseMove = (e: MouseEvent) => {
      if (!hasMoved) {
        gsap.to([dot, follower], { opacity: 1, duration: 0.3, ease: 'power2.out' });
        hasMoved = true;
      }
      xDotTo(e.clientX);
      yDotTo(e.clientY);
      xFollowerTo(e.clientX);
      yFollowerTo(e.clientY);
    };

    // Keep cursor visible when mouse moves, hide when leaving document bounds
    const onMouseLeaveDoc = () => {
      gsap.to([dot, follower], { opacity: 0, duration: 0.3, ease: 'power2.out' });
      hasMoved = false;
    };

    const onMouseEnterDoc = () => {
      gsap.to([dot, follower], { opacity: 1, duration: 0.3, ease: 'power2.out' });
      hasMoved = true;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeaveDoc);
    document.addEventListener('mouseenter', onMouseEnterDoc);

    // Dynamic scale and content shifts on hoverable elements
    const handleMouseEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const isProject = target.classList.contains('project-card');
      const isMagnetic = target.classList.contains('magnetic-btn');
      
      if (isProject) {
        gsap.to(follower, {
          width: 80,
          height: 80,
          borderColor: '#c5a880',
          backgroundColor: 'rgba(197, 168, 128, 0.1)',
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
        follower.innerHTML = '<span class="text-[10px] tracking-[0.2em] uppercase font-mono text-gold-text absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">View</span>';
      } else if (isMagnetic) {
        gsap.to(follower, {
          width: 60,
          height: 60,
          borderColor: '#c5a880',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        gsap.to(follower, {
          width: 55,
          height: 55,
          borderColor: '#c5a880',
          backgroundColor: 'rgba(197, 168, 128, 0.05)',
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
      
      gsap.to(dot, {
        scale: 0.5,
        backgroundColor: '#f7f5f0',
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(follower, {
        width: 40,
        height: 40,
        borderColor: 'rgba(197, 168, 128, 0.3)',
        backgroundColor: 'transparent',
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      gsap.to(dot, {
        scale: 1,
        backgroundColor: '#c5a880',
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      follower.innerHTML = '';
    };

    // Attach listeners to all buttons, links, and target elements
    const updateListeners = () => {
      const hoverables = document.querySelectorAll('a, button, [role="button"], .project-card, .hover-target, .magnetic-btn');
      hoverables.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    updateListeners();

    // Use a MutationObserver to dynamically attach hover effects as the pages render
    const observer = new MutationObserver(updateListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeaveDoc);
      document.removeEventListener('mouseenter', onMouseEnterDoc);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div 
        id="custom-cursor-dot" 
        ref={dotRef} 
        className="custom-cursor hidden md:block" 
        style={{ willChange: 'transform' }}
      />
      <div 
        id="custom-cursor-follower" 
        ref={followerRef} 
        className="custom-cursor-follower hidden md:block flex items-center justify-center" 
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
