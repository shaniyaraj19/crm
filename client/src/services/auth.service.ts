import apiClient, { ApiResponse, TokenManager } from './api';

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'sales_rep';
  phone?: string;
  timezone?: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'manager' | 'sales_rep';
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  profilePicture?: string;
  phone?: string;
  timezone: string;
  organizationId?: string;
  permissions: string[];
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      dealAssigned?: boolean;
      activityDue?: boolean;
      teamUpdates?: boolean;
    };
    dashboard?: {
      defaultView?: string;
      widgets?: string[];
    };
  };
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  profilePicture?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      dealAssigned?: boolean;
      activityDue?: boolean;
      teamUpdates?: boolean;
    };
    dashboard?: {
      defaultView?: string;
      widgets?: string[];
    };
  };
}

class AuthService {
  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<{ success: boolean; data?: AuthResponse; message?: string }> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        // Store tokens
        TokenManager.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return { success: true, data: response.data };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  }

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    
    if (response.success && response.data) {
      // Store tokens
      TokenManager.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    }
    
    throw new Error(response.message || 'Registration failed');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage
      TokenManager.clearTokens();
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ tokens: AuthTokens }>('/auth/refresh', {
      refreshToken,
    });

    if (response.success && response.data) {
      TokenManager.setTokens(
        response.data.tokens.accessToken,
        response.data.tokens.refreshToken
      );
      return response.data.tokens;
    }

    throw new Error(response.message || 'Token refresh failed');
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/auth/profile');
    
    if (response.success && response.data) {
      // Update stored user info
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
    
    throw new Error(response.message || 'Failed to fetch profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<{ user: User }>('/auth/profile', profileData);
    
    if (response.success && response.data) {
      // Update stored user info
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    }
    
    throw new Error(response.message || 'Failed to update profile');
  }

  /**
   * Change password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    const response = await apiClient.put('/auth/change-password', passwordData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await apiClient.post('/auth/forgot-password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to send reset email');
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await apiClient.post('/auth/reset-password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to reset password');
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post('/auth/verify-email', { token });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to verify email');
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const response = await apiClient.post('/auth/resend-verification', { email });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to resend verification email');
    }
  }

  /**
   * Get stored user
   */
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    const user = this.getStoredUser();
    return !!(token && user);
  }

  /**
   * Check if user has permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getStoredUser();
    return user?.permissions?.includes(permission) || false;
  }

  /**
   * Check if user has any of the given permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const user = this.getStoredUser();
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Check if user has role
   */
  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.role === role;
  }
}

// Create and export service instance
const authService = new AuthService();
export { authService }; // Named export
export default authService;