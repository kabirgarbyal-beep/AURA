export type ActivePage = 'home' | 'about' | 'projects' | 'services' | 'process' | 'blog' | 'contact' | 'archives';

export const PAGE_TO_PATH: Record<ActivePage, string> = {
  home: 'home',
  about: 'story',
  projects: 'gallery',
  services: 'islands',
  process: 'blueprint',
  blog: 'editorial',
  contact: 'contact',
  archives: 'archives'
};

export const PATH_TO_PAGE: Record<string, ActivePage> = {
  '': 'home',
  'home': 'home',
  'story': 'about',
  'gallery': 'projects',
  'islands': 'services',
  'blueprint': 'process',
  'editorial': 'blog',
  'contact': 'contact',
  'archives': 'archives'
};

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  description: string;
  imageBefore: string;
  imageAfter: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string[];
  color: string;
}

export interface ProcessMilestone {
  step: string;
  title: string;
  description: string;
  details: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  image: string;
}
