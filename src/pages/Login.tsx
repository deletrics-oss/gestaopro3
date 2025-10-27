import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Lock, User, KeyRound, RotateCcw } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456'); // Senha padrão para acesso rápido
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordAction = (action: 'change' | 'reset') => {
    const title = action === 'change' ? "Trocar Senha" : "Resetar Senha";
    toast({
      title: title,
      description: "A funcionalidade de " + title.toLowerCase() + " ainda não está implementada. Por favor, entre em contato com o suporte.",
      variant: "default",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        description: "Usuário ou senha incorretos. (Lembre-se que a senha padrão é 123456)",
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
            Faça login para continuar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between text-sm">
              <Button
                variant="link"
                type="button"
                onClick={() => handlePasswordAction('change')}
                className="p-0 h-auto text-sm text-muted-foreground hover:text-primary flex items-center"
              >
                <KeyRound className="w-4 h-4 mr-1" /> Trocar Senha
              </Button>
              <Button
                variant="link"
                type="button"
                onClick={() => handlePasswordAction('reset')}
                className="p-0 h-auto text-sm text-muted-foreground hover:text-primary flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Resetar Senha
              </Button>
            </div>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
