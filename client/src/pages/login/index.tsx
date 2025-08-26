import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginBackground from './components/LoginBackground';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SecurityFooter from './components/SecurityFooter';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <LoginBackground>
      <LoginHeader />
      <LoginForm />
      <SecurityFooter />
    </LoginBackground>
  );
};

export default LoginPage;