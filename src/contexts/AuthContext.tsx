import { createContext, useContext, useState, ReactNode } from 'react';
import { externalServer } from '@/api/externalServer';

export type Permission = 
  | 'dashboard' 
  | 'products' 
  | 'sales' 
  | 'reports' 
  | 'customers' 
  | 'materials' 
  | 'services' 
  | 'expenses' 
  | 'production' 
  | 'marketplace-orders' 
  | 'suppliers' 
  | 'employees' 
  | 'invoices' 
  | 'assets';

interface User {
  username: string;
  role: 'admin' | 'user';
  permissions?: Permission[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  changePassword: (username: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MODIFICAÇÃO: Lógica de login com fallback para senha padrão
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
    const DEFAULT_ADMIN_PASSWORD = "123456"; // Senha padrão para fallback - Altere no seu ambiente!
    const DEFAULT_ADMIN_USER = "admin";

    try {
      // 1. Tenta o login normal no backend
      const response = await externalServer.login({ username, password_hash: password });

      if (response && response.user) {
        const foundUser = response.user;
        const userData = { 
          username: foundUser.username, 
          role: foundUser.role || 'user',
          permissions: foundUser.permissions || []
        };
        setUser(userData);
        return true;
      }
      
      // 2. Fallback: Se o login normal falhar e for o usuário admin com a senha padrão
      if (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASSWORD) {
        console.warn("Login falhou, usando fallback de senha padrão para admin.");
        const userData = { 
          username: DEFAULT_ADMIN_USER, 
          role: 'admin' as const,
          permissions: []
        };
        setUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login failed:", error);

      // 3. Fallback em caso de erro de comunicação (CORS, etc.)
      if (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASSWORD) {
        console.warn("Erro de comunicação, usando fallback de senha padrão para admin.");
        const userData = { 
          username: DEFAULT_ADMIN_USER, 
          role: 'admin' as const,
          permissions: []
        };
        setUser(userData);
        return true;
      }

      return false;
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const changePassword = (username: string, newPassword: string): boolean => {
    console.warn("changePassword: A gestão de usuários deve ser feita via API do backend.");
    // TODO: Implementar endpoint no backend para mudança de senha
    return false;
  };

  // A função de logout é desativada para manter o usuário logado.
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, hasPermission, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

