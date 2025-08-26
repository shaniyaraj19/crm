import React from 'react';
import Icon from '../../../components/AppIcon';

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Company Logo */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center shadow-elevation-1">
          <Icon name="Zap" size={28} color="var(--color-primary)" />
        </div>
        <span className="ml-3 text-2xl font-bold text-foreground">CRM Pro</span>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground text-lg">
          Sign in to your account to continue
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;