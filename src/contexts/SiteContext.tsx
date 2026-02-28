import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Site } from '@/api/sites';

interface SiteContextType {
  currentSite: Site | null;
  setCurrentSite: (site: Site | null) => void;
  siteId: string | null;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 初始化时同步从 localStorage 读取站点信息，避免首屏 currentSite 为空导致路由误判
  const [currentSite, setCurrentSiteState] = useState<Site | null>(() => {
    const savedSite = localStorage.getItem('currentSite');
    if (!savedSite) return null;
    try {
      return JSON.parse(savedSite) as Site;
    } catch (e) {
      console.error('Failed to parse saved site:', e);
      return null;
    }
  });

  const setCurrentSite = (site: Site | null) => {
    setCurrentSiteState(site);
    if (site) {
      localStorage.setItem('currentSite', JSON.stringify(site));
    } else {
      localStorage.removeItem('currentSite');
    }
  };

  const siteId = currentSite?.site_id || null;

  return (
    <SiteContext.Provider value={{ currentSite, setCurrentSite, siteId }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};

