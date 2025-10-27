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

// MODIFICAÇÃO: O estado inicial do usuário foi definido para 'admin' para desativar a tela de login.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Força o estado inicial do usuário para 'admin' para pular a tela de login
  const [user, setUser] = useState<User | null>({ username: 'admin', role: 'admin', permissions: [] });

  // A função de login é desativada e retorna true, forçando a entrada direta.
  const login = async (username: string, password: string): Promise<boolean> => {
    console.warn("Login desabilitado. O usuário é forçado para 'admin'.");
    return true;
  };

  const hasPermission = (permission: Permission): boolean => {
    // Como o usuário é sempre 'admin', ele tem todas as permissões
    return true; 
  };

  const changePassword = (username: string, newPassword: string): boolean => {
    console.warn("changePassword: A gestão de usuários deve ser feita via API do backend.");
    // TODO: Implementar endpoint no backend para mudança de senha
    return false;
  };

  // A função de logout é desativada para manter o usuário logado.
  const logout = () => {
    console.warn("Logout desabilitado. O usuário é forçado para 'admin'.");
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

