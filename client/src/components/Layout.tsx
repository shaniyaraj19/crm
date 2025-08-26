import React, { useState, useEffect } from 'react';
import Header from './ui/Header';
import Sidebar from './ui/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header 
        onMobileMenuToggle={handleMobileMenuToggle} 
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileToggle={handleMobileMenuToggle}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={handleSidebarCollapse}
      />
      
      {/* Main Content */}
      <main className={`
        pt-24 transition-all duration-300 ease-in-out
        ${isSidebarCollapsed 
          ? 'md:pl-16' 
          : 'md:pl-20'
        }
      `}>
        <div className="p-2 md:p-4 max-w-full overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;