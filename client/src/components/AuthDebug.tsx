import React, { useState, useEffect } from 'react';

const AuthDebug: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<{
    hasToken: boolean;
    token: string | null;
    isLoggedIn: boolean;
  }>({
    hasToken: false,
    token: null,
    isLoggedIn: false
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    setAuthStatus({
      hasToken: !!token,
      token: token ? token.substring(0, 50) + '...' : null,
      isLoggedIn: !!(token && user)
    });
  }, []);

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleClearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">🔐 Auth Debug</h3>
      <div className="text-xs space-y-1">
        <div>
          <strong>Has Token:</strong> {authStatus.hasToken ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Logged In:</strong> {authStatus.isLoggedIn ? '✅ Yes' : '❌ No'}
        </div>
        {authStatus.token && (
          <div>
            <strong>Token:</strong> <code className="text-xs">{authStatus.token}</code>
          </div>
        )}
      </div>
      <div className="mt-3 space-x-2">
        {!authStatus.isLoggedIn ? (
          <button 
            onClick={handleLogin}
            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
          >
            Go to Login
          </button>
        ) : (
          <button 
            onClick={handleClearAuth}
            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
          >
            Clear Auth
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;