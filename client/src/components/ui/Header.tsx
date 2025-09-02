import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
  isSidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isSidebarCollapsed = false }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const notifications = [
    {
      id: 1,
      title: 'New lead assigned',
      message: 'Sarah Johnson has been assigned to you',
      time: '5 min ago',
      unread: true
    },
    {
      id: 2,
      title: 'Deal closed',
      message: 'Acme Corp deal worth $50,000 closed',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      title: 'Follow-up reminder',
      message: 'Call scheduled with Tech Solutions Inc.',
      time: '2 hours ago',
      unread: false
    }
  ];

  const handleProfileToggle = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/contacts-list') return 'Contacts';
    if (path === '/contact-details' || path.startsWith('/contact-details/')) return 'Contact Details';
     if (path === '/companies' && location.pathname.startsWith('/companies')) return 'Companies';
    if (path === '/analytics-dashboard') return 'Analytics';
    if (path === '/settings') return 'Settings';
    return 'Companies Details';
  };

  return (
    <header className={`
      fixed top-4 z-40 transition-all duration-300 ease-in-out
      ${isSidebarCollapsed 
        ? 'left-4 md:left-20 right-4' 
        : 'left-4 md:left-24 right-4'
      }
    `}>
      <div className="h-14 px-6 bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl shadow-black/10 flex items-center justify-between hover:shadow-2xl hover:shadow-black/15 transition-all duration-300 hover:bg-card/95">
        {/* Left Section - Mobile Menu + Title */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 hover:bg-muted rounded-md transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Icon name="Menu" size={16} className="text-muted-foreground" />
          </button>
          
          {/* Page Title */}
          <h1 className="text-base font-semibold text-card-foreground truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-1">
          {/* Search - Hidden on mobile */}
          <div className="hidden lg:flex items-center">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className={`
                  pl-8 pr-3 py-1.5 border border-border rounded-md text-sm bg-input text-foreground 
                  focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition-all
                  ${isSidebarCollapsed ? 'w-48' : 'w-40 xl:w-48'}
                `}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={handleNotificationsToggle}
              className="relative p-1.5 hover:bg-muted rounded-md transition-colors"
              aria-label="Notifications"
            >
              <Icon name="Bell" size={16} className="text-muted-foreground" />
              {notifications.filter(n => n.unread).length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-error rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevation-2 py-2 z-[60]">
                <div className="px-4 py-2 border-b border-border">
                  <h3 className="text-sm font-semibold text-popover-foreground">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-muted cursor-pointer ${
                        notification.unread ? 'bg-accent/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.unread ? 'bg-accent' : 'bg-muted-foreground'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-popover-foreground truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            to="/settings"
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
            aria-label="Settings"
          >
            <Icon name="Settings" size={16} className="text-muted-foreground" />
          </Link>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={handleProfileToggle}
              className="flex items-center space-x-1.5 p-1.5 hover:bg-muted rounded-md transition-colors"
              aria-label="User menu"
            >
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <Icon name="User" size={14} className="text-muted-foreground" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-card-foreground truncate max-w-20">
                John Doe
              </span>
              <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-elevation-2 py-2 z-[60]">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-popover-foreground">John Doe</p>
                  <p className="text-xs text-muted-foreground">admin@techcorp.com</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Icon name="User" size={16} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Icon name="Settings" size={16} />
                  <span>Settings</span>
                </Link>
                <hr className="my-2 border-border" />
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Handle logout
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 w-full text-left transition-colors"
                >
                  <Icon name="LogOut" size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;