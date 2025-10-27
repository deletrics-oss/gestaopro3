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
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  changePassword: (username: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const register = async (username: string, password: string): Promise<boolean> => {
    try {
        const response = await externalServer.register({ username, password_hash: password });

        if (response && response.user) {
            // Assume que o registro bem-sucedido também faz o login
            // O backend deve retornar o usuário e o token
            const foundUser = response.user;
            const userData = { 
                username: foundUser.username, 
                role: foundUser.role || 'user',
                permissions: foundUser.permissions || []
            };
            // Note: Não podemos chamar setUser diretamente aqui, pois estamos fora do AuthProvider.
            // A solução mais simples é chamar o login após o registro.
            return true;
        }
        return false;
    } catch (error) {
        console.error("Registration failed:", error);
        return false;
    }
};
// MODIFICAÇÃO: O estado inicial do usuário foi definido para 'admin' para desativar a tela de loginexport function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, password: string): Promise<boolean> => {
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
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };     const foundUser = response.user;
        const userData = { 
          username: foundUser.username, 
          role: foundUser.role || 'user',
          permissions: foundUser.permissions || []
        };
        setUser(userData);
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

  const changePassword = (username: string, newPassword: string): boolean => {
    console.warn("changePassword: A gestão de usuários deve ser feita via API do backend.");
    // TODO: Implementar endpoint no backend para mudança de senha
    return false;
  };

  // A função de logout é desativada para manter o usuário logado.
  const logout = () => {
    setUser(null);
  };

  const handleRegister = async (username: string, password: string): Promise<boolean> => {
    const success = await register(username, password);
    if (success) {
      // Tenta logar automaticamente após o registro
      return login(username, password);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register: handleRegister, isAuthenticated: !!user, hasPermission, changePassword }}>
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

