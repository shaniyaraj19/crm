import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumbs = () => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbMap = {
      '': { label: 'Dashboard', path: '/dashboard' },
      'dashboard': { label: 'Dashboard', path: '/dashboard' },
      'contacts-list': { label: 'Contacts', path: '/contacts-list' },
      'contact-details': { label: 'Contact Details', path: '/contact-details' },
      'analytics-dashboard': { label: 'Analytics', path: '/analytics-dashboard' }
    };

    const breadcrumbs = [
      { label: 'Dashboard', path: '/dashboard', isHome: true }
    ];

    if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'dashboard')) {
      return breadcrumbs;
    }

    pathSegments.forEach((segment, index) => {
      const breadcrumb = breadcrumbMap[segment];
      if (breadcrumb && breadcrumb.path !== '/dashboard') {
        breadcrumbs.push({
          ...breadcrumb,
          isLast: index === pathSegments.length - 1
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Don't render breadcrumbs on login page or if only showing dashboard
  if (location.pathname === '/login' || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1.5">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.path} className="flex items-center space-x-1.5">
            {index > 0 && (
              <Icon name="ChevronRight" size={12} className="text-muted-foreground/60" />
            )}
            
            {breadcrumb.isHome && (
              <Icon name="Home" size={12} className="text-muted-foreground/80" />
            )}
            
            {breadcrumb.isLast ? (
              <span className="font-medium text-foreground" aria-current="page">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                to={breadcrumb.path}
                className="hover:text-foreground transition-smooth"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;