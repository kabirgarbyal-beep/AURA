/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import { ActivePage, PATH_TO_PAGE } from './types';

// Global Layout Components
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';
import CustomCursor from './components/CustomCursor';

// Individual Page Views
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import ProjectsView from './components/ProjectsView';
import ServicesView from './components/ServicesView';
import ProcessView from './components/ProcessView';
import BlogView from './components/BlogView';
import ContactView from './components/ContactView';
import ArchivesView from './components/ArchivesView';
import Footer from './components/Footer';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Deep-linking routing mechanism using standard HTML5 History API
  const getInitialPage = (): ActivePage => {
    const path = window.location.pathname.replace('/', '');
    return PATH_TO_PAGE[path] || 'home';
  };

  const [activePage, setActivePage] = useState<ActivePage>(getInitialPage());

  // Handle browser back and forward button clicks
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '');
      setActivePage(PATH_TO_PAGE[path] || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize Lenis smooth scroll for pages with vertical scroll contents
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // cinematic smooth ease-out
    });

    const onScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = (window.scrollY / scrollHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }
    };

    lenis.on('scroll', onScroll);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Initial check
    onScroll();

    return () => {
      lenis.destroy();
    };
  }, [activePage]);

  return (
    <>
      {/* Luxury Cinematic Preloader */}
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      {/* Global Custom Cursor Layers (Only on mouse-enabled viewports) */}
      <CustomCursor />

      {/* Luxury Ambient Noise Overlays */}
      <div className="noise-bg" />

      {/* Global Navigation Frame */}
      {!loading && (
        <Navigation 
          activePage={activePage} 
          setActivePage={setActivePage} 
          scrollProgress={scrollProgress} 
        />
      )}

      {/* Dynamic Viewport Router */}
      <main className="w-full min-h-screen relative overflow-hidden flex flex-col justify-between">
        <div className="flex-grow">
          {activePage === 'home' && <HomeView setActivePage={setActivePage} />}
          {activePage === 'about' && <AboutView />}
          {activePage === 'projects' && <ProjectsView />}
          {activePage === 'services' && <ServicesView />}
          {activePage === 'process' && <ProcessView />}
          {activePage === 'blog' && <BlogView />}
          {activePage === 'contact' && <ContactView />}
          {activePage === 'archives' && <ArchivesView />}
        </div>
        <Footer setActivePage={setActivePage} />
      </main>
    </>
  );
}
