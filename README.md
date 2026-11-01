# Maia Racket Center — Bar

Um único site GitHub Pages (`Ncf16/ncf16.github.io` → https://www.azpadel-maia-bar.com) com duas apps:

```
index.html                  → página de entrada (encaminha ?t=… para o menu)
menu/index.html             → app do cliente: mesa, menu, pedido
admin/index.html            → app do bar: pedidos em tempo real, configuração (requer login)
assets/common.css|js        → tokens de estilo e helpers partilhados pelas duas apps
firebase/database.rules.json→ regras de segurança a aplicar no Firebase (ver firebase/README.md)
```

## Links por mesa (QR codes)

Cada mesa tem um link que abre o menu já com a mesa escolhida. O parâmetro `t` é o
número da mesa em base64 (Mesa 1 → `MQ==`, Mesa 7 → `Nw==`, Mesa 12 → `MTI=`):

```
https://www.azpadel-maia-bar.com/menu/?t=MQ==
https://www.azpadel-maia-bar.com/?t=MQ==        (a raiz encaminha para o menu)
```

Os links de todas as mesas estão em `/admin/` → ⚙️ Config → "Links das mesas", com botão de copiar.
`?t=` também funciona em `/admin/` para abrir o painel já filtrado por essa mesa.

## Como funciona

- **Firebase Realtime Database** é a única fonte de verdade: `orders/` (pedidos), `config/`
  (nº de mesas, sheet do menu, URL do registo) e `archive/` (pedidos entregues já arquivados).
- O **menu dos clientes** lê `config/` em tempo real — mudar o nº de mesas no painel chega aos telemóveis sem recarregar.
- O **painel do bar** precisa de login (Firebase Auth) e só carrega as últimas 36 h de pedidos. O botão
  🧹 Arquivar move os entregues para `archive/AAAA-MM-DD/`.
- **Google Sheets** é opcional e tem dois papéis separados: fonte do menu (uma sheet pública lida por CSV)
  e registo de histórico (um Apps Script que recebe cada pedido/estado — o bar nunca lê pedidos da sheet).

## Publicar

1. Faz push desta pasta para `main` do repositório `Ncf16/ncf16.github.io`.
2. Settings → Pages → Source: `main` / `/ (root)` (já está assim).
3. **Aplica as regras e cria a conta do bar** — passos em `firebase/README.md`. Sem isto o painel pede login e não consegue ler nada.

## Desenvolvimento local

```bash
python3 -m http.server 5500
```

Abre `http://localhost:5500` (os caminhos `../assets/…` precisam de um servidor, não funciona por `file://`).

## Menu numa Google Sheet (opcional)

Sheet partilhada como "Qualquer pessoa com o link pode ver", com cabeçalho na primeira linha:

| cat | id | name | desc | price |
|---|---|---|---|---|
| 🥤 Bebidas Frias | 1 | Água | 50cl | 1,5 |

`price` aceita `1,5`, `1.5`, `1,50 €`. Cola o URL da sheet em Config → "Menu — Google Sheet".
