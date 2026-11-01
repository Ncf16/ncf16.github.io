# Firebase — configuração necessária (uma vez)

Sem estes passos o painel do bar não consegue ver pedidos nem guardar a configuração.
Demora ~5 minutos. Tudo é feito em https://console.firebase.google.com → o teu projeto.

## 1. Regras da base de dados

Realtime Database → separador **Rules** → apaga o que lá está, cola o conteúdo de
`database.rules.json` → **Publish**.

O que as regras fazem:

| Nó | Clientes (sem login) | Bar (login + `admins/<uid>`) |
|---|---|---|
| `config/` | ler | ler + escrever (campos validados) |
| `orderCounter` | ler + incrementar de 1 em 1 | idem |
| `orders/<num>` | **criar** (uma vez, `status: new`, campos validados, mesa dentro do nº de mesas, nota ≤ 300 chars) | ler, mudar estado, apagar (arquivar) |
| `archive/` | nada | ler + escrever |
| tudo o resto | nada | nada |

## 2. Conta do bar

1. **Authentication → Sign-in method → Email/Password → Enable** → Save.
2. **Authentication → Users → Add user** → email + palavra-passe do bar (ex.: `bar@azpadel-maia-bar.com`).
3. Na lista de utilizadores copia o **User UID** dessa conta.
4. **Realtime Database → Data** → no nó raiz cria `admins` → dentro, uma chave com o UID e valor `true`:
   ```
   admins
     └─ k3J9...abc (o UID)  : true
   ```
   Podes adicionar mais UIDs para mais dispositivos/contas.
5. Opcional mas recomendado: **Authentication → Settings → User actions** → desliga *Enable create (sign-up)*.
   (As regras já ignoram contas que não estejam em `admins/`, isto só evita contas de lixo.)

## 3. Primeira utilização

Abre `/admin/`, entra com a conta, ⚙️ Config → confirma o nº de mesas → **Guardar & Ligar**.
Isto cria `config/` no servidor; a partir daí o menu dos clientes lê daí o nº de mesas (e o resto).

## Perguntas frequentes

**A API key está no código — não é um problema?** Não: a API key do Firebase identifica o projeto,
não autoriza nada; a segurança está nas regras acima. Se quiseres, restringe a chave ao teu domínio em
Google Cloud Console → APIs & Services → Credentials → a chave → *Website restrictions*.

**"Conta sem permissão" depois de entrar** — o UID não está em `admins/` (passo 2.4). O ecrã de login mostra o UID a copiar.

**"Sem permissão (regras da base de dados)" ao fazer um pedido no telemóvel** — quase sempre é
`config/tableCount` menor do que a mesa escolhida (regra `table < tableCount`) ou um campo fora do validado.
Vê Realtime Database → *Rules Playground* para testar.

**Quero ver pedidos antigos** — ficam em `archive/AAAA-MM-DD/<num>` depois de "🧹 Arquivar" no painel.
O painel só carrega as últimas 36 h (máx. 300 pedidos); arquiva no fim do dia para manter a base de dados pequena.
