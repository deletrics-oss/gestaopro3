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
    try {
      // Simulação: O frontend deve enviar o hash da senha, mas o backend
      // está simplificado para apenas verificar a existência do usuário por username.
      // Para o teste, vamos enviar a senha em texto puro para o backend simplificado.
      const response = await externalServer.login({ username, password_hash: password });

      if (response && response.user) {
        const foundUser = response.user;
        const userData = { 
          username: foundUser.username, 
          role: foundUser.role || 'user', // Assumindo 'user' se não vier do backend
          permissions: foundUser.permissions || []
        };
        setUser(userData);
        localStorage.setItem('current_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  // A função changePassword foi removida/simplificada, pois a gestão de usuários
  // deve ser feita via API do backend.
  const changePassword = (username: string, newPassword: string): boolean => {
    console.warn("changePassword: A gestão de usuários deve ser feita via API do backend.");
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