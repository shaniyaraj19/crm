import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock credentials for authentication
  const mockCredentials = {
    email: 'admin@crmPro.com',
    password: 'CRM@2025'
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Check mock credentials
      if (formData.email === mockCredentials.email && formData.password === mockCredentials.password) {
        // Store authentication state
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', formData.email);
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setErrors({
          general: `Invalid credentials. Use ${mockCredentials.email} / ${mockCredentials.password}`
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    alert('Password reset functionality would be implemented here. For demo, use: admin@crmPro.com / CRM@2025');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Message */}
        {errors.general && (
          <div className="bg-error/10 border border-error/20 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error" />
              <p className="text-sm text-error font-medium">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Email Field */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
          disabled={isLoading}
        />

        {/* Password Field */}
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
          disabled={isLoading}
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-smooth"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;