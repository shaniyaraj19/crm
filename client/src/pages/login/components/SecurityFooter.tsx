import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-8 text-center space-y-4">
      {/* Security Indicators */}
      <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={16} className="text-success" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="Lock" size={16} className="text-success" />
          <span>256-bit Encryption</span>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="CheckCircle" size={16} className="text-success" />
          <span>SOC 2 Compliant</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border/50"></div>

      {/* Copyright */}
      <div className="text-sm text-muted-foreground">
        <p>© {currentYear} CRM Pro. All rights reserved.</p>
        <div className="flex items-center justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-foreground transition-smooth">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-smooth">Terms of Service</a>
          <span>•</span>
          <a href="#" className="hover:text-foreground transition-smooth">Support</a>
        </div>
      </div>
    </div>
  );
};

export default SecurityFooter;