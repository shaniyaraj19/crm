import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { authService } from '../../../services/auth.service';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      // Use real authentication service
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (response.success) {
        // Authentication successful - authService handles token storage
        navigate('/dashboard');
      } else {
        // Handle login failure
        setErrors({
          general: response.message || 'Login failed. Please check your credentials.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        setErrors({
          general: 'Invalid email or password. Please try again.'
        });
      } else if (error.response?.status === 429) {
        setErrors({
          general: 'Too many login attempts. Please try again later.'
        });
      } else if (error.response?.data?.message) {
        setErrors({
          general: error.response.data.message
        });
      } else {
        setErrors({
          general: 'Login failed. Please check your connection and try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your V-Accel CRM account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <Icon name="AlertCircle" className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              error={errors.email}
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              error={errors.password}
              disabled={isLoading}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Icon name="Loader2" className="animate-spin h-4 w-4 mr-2" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={handleSignUp}
              className="font-medium text-blue-600 hover:text-blue-500"
              disabled={isLoading}
            >
              Sign up here
            </button>
          </p>
        </div>

        {/* Demo Credentials Helper */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>Admin:</strong> admin@techcorp.com / admin123</p>
            <p><strong>Manager:</strong> manager1@techcorp.com / admin123</p>
            <p><strong>Sales:</strong> sales1@techcorp.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;