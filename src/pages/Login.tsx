import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Lock, User, UserPlus } from 'lucide-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(username, password);

    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Erro ao fazer login",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!register) {
      toast({
        title: "Erro de Cadastro",
        description: "A funcionalidade de registro não está disponível.",
        variant: "destructive",
      });
      return;
    }

    const success = await register(username, password);

    if (success) {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você foi logado automaticamente.",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível criar o usuário. Tente novamente ou use outro nome de usuário.",
        variant: "destructive",
      });
    }
  };
    e.preventDefault();
    
    const success = await login(username, password);

    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Erro ao fazer login",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
              {isRegistering ? (
                <UserPlus className="w-10 h-10 text-primary-foreground" />
              ) : (
                <Lock className="w-10 h-10 text-primary-foreground" />
              )}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Sistema de Gestão</CardTitle>
          <p className="text-muted-foreground">
            {isRegistering ? "Crie sua conta" : "Faça login para continuar"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {isRegistering ? "Cadastrar e Entrar" : "Entrar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering
                ? "Já tem uma conta? Faça login"
                : "Não tem uma conta? Cadastre-se"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
