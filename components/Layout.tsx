import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  // Only hide nav on truly immersive screens like recording
  const noNavPaths = ['/gravar/'];
  
  const showNav = !noNavPaths.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-start to-bg-end text-text flex flex-col font-sans">
      <main className={`flex-grow container mx-auto px-4 py-8 ${showNav ? 'mb-28' : ''}`}>
        {children}
      </main>
      {showNav && <Navbar />}
    </div>
  );
};

export default Layout;
