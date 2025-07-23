import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }

  const handleSuccess = () => {
    // Navigation will happen automatically due to auth state change
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {isLogin ? (
        <LoginForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
      ) : (
        <RegisterForm onSuccess={handleSuccess} onToggleMode={toggleMode} />
      )}
    </div>
  );
};