import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Forçando o redirecionamento para o dashboard, já que o AuthContext força a autenticação
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
