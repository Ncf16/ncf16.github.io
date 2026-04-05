# Maia Racket Center — Bar

## Estrutura

```
index.html        → Página de entrada
menu/index.html   → App do cliente (mesa, menu, pedido)
admin/index.html  → App de gestão (pedidos, configuração)
```

## GitHub Pages

1. Faz upload desta pasta para um repositório GitHub
2. Vai a Settings → Pages → Source: `main` / `/ (root)`
3. URLs ficam disponíveis em:
   - `https://USERNAME.github.io/REPO/`
   - `https://USERNAME.github.io/REPO/menu/`
   - `https://USERNAME.github.io/REPO/admin/`

## Desenvolvimento local

```bash
python3 -m http.server 5500
```

Abre `http://localhost:5500`
