import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  currentAppId: string;
  setCurrentAppId: (appId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_APP_ID = 'templatewapversion2';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 初始化时从 localStorage 读取，默认使用 templatewapversion2
  const [currentAppId, setCurrentAppIdState] = useState<string>(() => {
    const savedAppId = localStorage.getItem('appId');
    return savedAppId || DEFAULT_APP_ID;
  });

  const setCurrentAppId = (appId: string) => {
    setCurrentAppIdState(appId);
    localStorage.setItem('appId', appId);
  };

  return (
    <AppContext.Provider value={{ currentAppId, setCurrentAppId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

