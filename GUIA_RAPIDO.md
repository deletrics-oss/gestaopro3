# ⚡ Guia Rápido de Correção - GestaoPro2

## 🎯 Objetivo
Corrigir o problema onde dados ficam salvos localmente em cada máquina.

---

## 🚀 Passo a Passo (30 minutos)

### 1️⃣ Preparação (5 min)

```bash
# Fazer backup
cd /caminho/do/seu/projeto
git add .
git commit -m "backup antes das correções"

# Iniciar o servidor
python3 server.py
# Deve aparecer: Running on http://localhost:8089
```

---

### 2️⃣ Migrar Dados Existentes (10 min)

1. Abra `migrate_data.html` no navegador
2. Clique em "Verificar Conexão com Servidor" → deve ficar verde ✅
3. Clique em "Analisar localStorage" → veja quantos dados tem
4. Clique em "🚀 Iniciar Migração"
5. Aguarde a conclusão
6. Verifique o log para confirmar que tudo foi migrado

---

### 3️⃣ Aplicar Correções (15 min)

#### A) Corrigir AuthContext.tsx

**Substituir o arquivo:**
```bash
cp arquivos_corrigidos/AuthContext.tsx src/contexts/AuthContext.tsx
```

**OU copiar manualmente:**
- Abra `arquivos_corrigidos/AuthContext.tsx`
- Copie todo o conteúdo
- Cole em `src/contexts/AuthContext.tsx`

---

#### B) Corrigir UserManagement.tsx

**Adicionar imports no topo:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { externalServer } from '@/api/externalServer';
```

**Substituir a função loadUsers():**
```typescript
// REMOVER:
const loadUsers = () => {
  const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
  setUsers(storedUsers);
};

// ADICIONAR:
const queryClient = useQueryClient();

const { data: users = [], isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => externalServer.getFromExternalDatabase('users')
});
```

**Substituir handleAddUser:**
```typescript
// REMOVER localStorage.setItem
// ADICIONAR:
const createUserMutation = useMutation({
  mutationFn: (newUser: any) => externalServer.saveToExternalDatabase('users', {
    username: newUser.username,
    password_hash: newUser.password,
    role: newUser.role,
    permissions: JSON.stringify(newUser.permissions)
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    toast({ title: "Usuário criado!" });
  }
});

const handleAddUser = (e: React.FormEvent) => {
  e.preventDefault();
  createUserMutation.mutate(newUser);
};
```

---

#### C) Corrigir Dashboard.tsx

**Adicionar imports:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { externalServer } from '@/api/externalServer';
```

**Substituir a busca de cashMovements:**
```typescript
// REMOVER:
const cashMovements = (() => {
  const stored = localStorage.getItem('cash_movements');
  return stored ? JSON.parse(stored) : [];
})();

// ADICIONAR:
const { data: cashMovements = [], isLoading } = useQuery({
  queryKey: ['cash_movements'],
  queryFn: () => externalServer.getFromExternalDatabase('cash_movements')
});
```

---

### 4️⃣ Testar (5 min)

```bash
# Reiniciar o frontend
npm run dev
```

**No navegador:**
1. Abra DevTools (F12)
2. Application → Local Storage → Clear All
3. Recarregue a página
4. Faça login
5. Crie um usuário de teste
6. Abra em outro navegador/máquina
7. Faça login
8. ✅ O usuário deve aparecer!

---

## 🔍 Verificação Rápida

### ✅ Está funcionando se:
- [ ] Servidor rodando na porta 8089
- [ ] Arquivo `gestaopro.db` existe na raiz do projeto
- [ ] Login funciona
- [ ] Dados criados em uma máquina aparecem em outra
- [ ] Console do navegador não mostra erros de API

### ❌ Não está funcionando se:
- [ ] Erro "Failed to fetch"
- [ ] Dados não aparecem em outra máquina
- [ ] Erro 404 nas requisições
- [ ] Servidor não inicia

---

## 🆘 Solução Rápida de Problemas

### Problema: "Failed to fetch"
```bash
# Verificar se servidor está rodando
curl http://localhost:8089/bancoexterno/users

# Se não responder, reiniciar:
python3 server.py
```

### Problema: "Erro 404"
Verificar em `src/api/externalServer.ts`:
```typescript
const EXTERNAL_SERVER_BASE = 'http://localhost:8089';
```

### Problema: "Dados não aparecem"
```bash
# Verificar se dados estão no banco
sqlite3 gestaopro.db "SELECT * FROM users;"
```

---

## 📋 Checklist Final

- [ ] Backup feito
- [ ] Servidor rodando
- [ ] Dados migrados
- [ ] AuthContext.tsx corrigido
- [ ] UserManagement.tsx corrigido
- [ ] Dashboard.tsx corrigido
- [ ] localStorage limpo
- [ ] Teste multi-máquina OK
- [ ] ✅ Problema resolvido!

---

## 💡 Dica Importante

**Após as correções, o login NÃO persiste ao recarregar a página.**

Se quiser manter o usuário logado:
1. Implemente JWT tokens no backend
2. Ou use cookies de sessão
3. Ou aceite que o usuário precisa fazer login a cada vez

---

## 🎉 Pronto!

Seu sistema agora usa banco de dados centralizado!

**Próximos passos:**
- Fazer commit das mudanças
- Testar em produção
- Documentar para a equipe

---

**Tempo total:** ~30 minutos  
**Dificuldade:** Média  
**Resultado:** Sistema funcionando corretamente! 🚀

