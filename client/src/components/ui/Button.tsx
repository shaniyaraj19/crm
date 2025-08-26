import React from "react";
import { cn } from "../../utils/cn";
import { ButtonProps } from "../../types";
import Icon from "../AppIcon";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md", 
    isLoading = false,
    iconName,
    iconPosition = "left",
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    };

    const sizes = {
      sm: "h-7 px-2.5 text-xs",
      md: "h-8 px-3 py-1.5 text-sm",
      lg: "h-10 px-6 text-base",
    };

    const renderIcon = () => {
      if (!iconName) return null;
      const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;
      return <Icon name={iconName} size={iconSize} />;
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="mr-1.5 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!isLoading && iconName && iconPosition === 'left' && (
          <span className={children ? "mr-1.5" : ""}>{renderIcon()}</span>
        )}
        {children}
        {!isLoading && iconName && iconPosition === 'right' && (
          <span className={children ? "ml-1.5" : ""}>{renderIcon()}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;