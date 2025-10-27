import { Navigate } from 'react-router-dom';
import { useAuth, Permission } from '@/contexts/AuthContext';

interface PermissionRouteProps {
  children: React.ReactNode;
  permission: Permission;
}

export default function PermissionRoute({ children, permission }: PermissionRouteProps) {
  const { isAuthenticated, hasPermission } = useAuth();

  if (!isAuthenticated) {
    // Forçando o redirecionamento para o dashboard, já que o AuthContext força a autenticação
    return <Navigate to="/dashboard" replace />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
