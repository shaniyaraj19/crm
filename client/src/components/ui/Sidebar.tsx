import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isMobileOpen = false, 
  onMobileToggle,
  isCollapsed = false,
  onCollapsedChange
}) => {
  const location = useLocation();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'LayoutDashboard',
      tooltip: 'CRM Overview'
    },
    {
      label: 'Contacts',
      path: '/contacts-list',
      icon: 'Users',
      tooltip: 'Manage Customer Relationships',
      children: [
        { label: 'All Contacts', path: '/contacts-list' },
        { label: 'Contact Details', path: '/contact-details' }
      ]
    },
    {
    label: 'Companies',
    path: '/companies', 
    icon: 'Briefcase',  
    tooltip: 'Manage Companies'
  },
    {
      label: 'Analytics',
      path: '/analytics-dashboard',
      icon: 'BarChart3',
      tooltip: 'Performance Insights'
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: 'Settings',
      tooltip: 'Configure Your CRM'
    }
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    if (path === '/contacts-list' && (location.pathname === '/contacts-list' || location.pathname === '/contact-details' || location.pathname.startsWith('/contact-details/'))) return true;
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    if (onMobileToggle) onMobileToggle();
  };

  const toggleCollapse = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!isCollapsed);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Auto-close mobile menu on desktop
        if (isMobileOpen && onMobileToggle) {
          onMobileToggle();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen, onMobileToggle]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-primary text-primary-foreground shadow-elevation-2 z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-20'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center p-2 border-b border-primary-foreground/20">
          <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center mb-0.5">
            <Icon name="Zap" size={16} className="text-accent-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-xs font-bold text-primary-foreground text-center leading-tight">V-Accel</span>
          )}
          
          {/* Mobile Close Button */}
          <button
            onClick={closeMobileMenu}
            className="md:hidden absolute top-2 right-2 p-1 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <Icon name="X" size={14} className="text-primary-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-1.5 overflow-y-auto">
          <ul className="space-y-0.5">
            {navigationItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`
                    flex flex-col items-center justify-center px-1.5 py-2.5 rounded-md transition-colors group relative
                    ${isActiveRoute(item.path) 
                      ? 'bg-green-600 text-white' 
                      : 'text-green-700 hover:bg-green-600 hover:text-white'
                    }
                  `}
                  title={isCollapsed ? item.tooltip : ''}
                >
                  <Icon 
                    name={item.icon} 
                    size={16} 
                    className={`flex-shrink-0 mb-0.5 ${isActiveRoute(item.path) ? 'text-white' : 'text-green-700'}`} 
                  />
                  {!isCollapsed && (
                    <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-card text-card-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* User Section */}
          <div className="mt-2 pt-2 border-t border-primary-foreground/20">
            <div className="flex flex-col items-center justify-center px-1.5 py-1.5">
              <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
                <Icon name="User" size={12} className="text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <div className="text-center">
                  <p className="text-xs font-medium text-primary-foreground">John</p>
                  <p className="text-xs text-primary-foreground/60">Admin</p>
                </div>
              )}
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;