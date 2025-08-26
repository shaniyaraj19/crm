import React from "react";
import * as LucideIcons from "lucide-react";
import { IconProps } from "../types";

const AppIcon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className = "" 
}) => {
  const IconComponent = (LucideIcons as any)[name] as React.ComponentType<any>;
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return <LucideIcons.HelpCircle size={size} className={className} />;
  }

  return <IconComponent size={size} className={className} />;
};

AppIcon.displayName = "AppIcon";

export default AppIcon;