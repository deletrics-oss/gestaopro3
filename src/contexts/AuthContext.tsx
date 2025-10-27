import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

// SOLUÇÃO DE BYPASS: Força o login para o usuário 'admin' com a senha '123456'
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Tenta carregar usuário do localStorage (se houver)
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const DEFAULT_ADMIN_PASSWORD = "123456"; // Senha padrão para fallback - Altere no seu ambiente!
    const DEFAULT_ADMIN_USER = "admin";

    // 1. Tenta o login normal no backend
    try {
      const response = await externalServer.login({ username, password_hash: password });

      if (response && response.user) {
        const foundUser = response.user;
        const userData = { 
          username: foundUser.username, 
          role: foundUser.role || 'user',
          permissions: foundUser.permissions || []
        };
        setUser(userData);
        localStorage.setItem('current_user', JSON.stringify(userData));
        return true;
      }
    } catch (error) {
      console.error("Login failed (Backend communication error):", error);
    }
    
    // 2. Fallback: Se o login normal falhar, tenta com a senha padrão
    if (username === DEFAULT_ADMIN_USER && password === DEFAULT_ADMIN_PASSWORD) {
      console.warn("Login falhou, usando fallback de senha padrão para admin.");
      const userData = { 
        username: DEFAULT_ADMIN_USER, 
        role: 'admin' as const,
        permissions: []
      };
      setUser(userData);
      localStorage.setItem('current_user', JSON.stringify(userData));
      return true;
    }

    return false;
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('current_user');
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

