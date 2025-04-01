
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const AuthPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Welcome to Macro</h1>
        <p className="text-muted-foreground mt-2">Sign in or create an account to start automating workflows</p>
      </div>
      <AuthForm />
    </div>
  );
};

export default AuthPage;
