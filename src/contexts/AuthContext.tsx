import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { externalServer } from '@/api/externalServer'; // Importar o externalServer

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

// Usuários padrão armazenados no localStorage - PERMANENTES
// Usuários padrão armazenados no localStorage - REMOVIDO
// A autenticação agora é feita pelo backend SQL

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há usuário logado
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // BYPASS DEFINITIVO: Ignora o backend e força o login
    const BYPASS_USER = "admin";
    const BYPASS_PASSWORD = "123456";

    // Apenas para que o compilador não reclame, mas a lógica real é ignorada
    if (username === BYPASS_USER && password === BYPASS_PASSWORD) {
      const userData: User = { 
        username: BYPASS_USER, 
        role: 'admin',
        permissions: ['dashboard', 'products', 'sales', 'reports', 'customers', 'materials', 'services', 'expenses', 'production', 'marketplace-orders', 'suppliers', 'employees', 'invoices', 'assets']
      };
      setUser(userData);
      localStorage.setItem('current_user', JSON.stringify(userData));
      console.warn("BYPASS DE LOGIN ATIVADO: Acesso forçado como admin/123456. Remova este código em produção.");
      return true;
    }
    
    // Se não for o usuário de bypass, tenta o login normal (que está falhando devido ao CORS)
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
      return false;
    } catch (error) {
      console.error("Login failed (Backend communication error):", error);
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

