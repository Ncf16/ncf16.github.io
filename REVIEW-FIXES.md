# Review → o que foi corrigido (v2)

Mapeamento ponto a ponto do `REVIEW.md` anterior. Tudo isto vive no **mesmo** site GitHub Pages — não é preciso segundo repositório.

| | Item da review | Correção |
|---|---|---|
| 🔴 | **Base de dados aberta a toda a gente** (qualquer pessoa lia/editava pedidos, contador e config) | `firebase/database.rules.json`: clientes só podem *criar* um pedido (campos validados, `status: new`, mesa dentro de `config/tableCount`, nota ≤ 300) e incrementar o contador de 1 em 1; ler pedidos, mudar estado, arquivar e escrever `config/` exige **login + UID em `admins/`** (uma conta auto-registada não ganha acesso). O painel tem ecrã de login (Firebase Auth email/password), botão Sair, e explica o que falta quando é recusado (incl. o UID a autorizar). Enquanto as regras antigas estiverem ativas o painel continua a funcionar mas mostra um aviso amarelo. |
| 🔴 | **Fallback do nº de pedido sobrepunha pedidos reais** (`++localCounter` → `orders/1.set()`) | Removido. Se o contador ou a escrita falharem/expirarem (12 s), o cliente vê "Pedido não enviado — tenta novamente ou fala com o bar" e o carrinho fica intacto. Nunca se escreve com um número inventado. |
| 🔴 | **XSS** (notas e nomes em `innerHTML` sem escapar) | `MRC.esc()` em todos os pontos; os botões deixaram de usar `onclick="…${id}…"` — é tudo delegação de eventos com `data-*`. `items` vindos da base de dados passam por `safeJsonArray` (JSON inválido já não rebenta o painel) e por limites de tamanho. |
| 🟠 | **Config do painel nunca chegava ao menu** (sheet ID só em `localStorage`; `MENU_SHEET_ID = ''` fixo) | `config/` no Firebase guarda `tableCount`, `menuSheetId`, `menuSheetName`, `scriptUrl`; o painel escreve-os, o menu ouve-os em tempo real. Em `localStorage` do painel ficam só as credenciais Firebase (+ cache). Aceita o URL completo da sheet (extrai o ID). |
| 🟠 | **Backend "Google Sheets" para pedidos** — o menu nunca escrevia lá; estado só local, dessincronizado entre dispositivos | O toggle Firebase/Sheets foi removido: o Firebase é a única fonte de pedidos. Sheets passou a ser o que realmente funcionava: (a) fonte do menu, (b) **registo opcional** — o menu envia `add` por pedido e o painel envia `update` por mudança de estado para o Apps Script (fire-and-forget; guia atualizado no modal). |
| 🟠 | **Pedidos entregues nunca eram apagados; painel carregava a base toda** | Listener com `orderByChild('time').startAt(agora − 36 h).limitToLast(300)` (+ `.indexOn: ["time"]` nas regras). Botão **🧹 Arquivar** move os entregues para `archive/AAAA-MM-DD/<num>` numa escrita atómica. |
| 🟠 | **`firebase.app().delete()` em cada gravação** (janela em que um clique rebentava com "app deleted") | A app só é destruída/recriada quando o URL ou a API key mudam. Gravar config só troca listeners. Uma gravação pendente (`pendingShared`) impede que o listener reverta o valor acabado de guardar, e é escrita assim que houver sessão. |
| 🟡 | Datas: `new Date(o.time)` em sítios diferentes, sem tratamento de inválidos | `MRC.parseTime` / `timeHM` / `localDateKey` — datas inválidas mostram "—" e não contam para "Hoje". |
| 🟡 | Preços da sheet (`"2.5 €"` → 2.5, `"€2.5"` → 0) | `MRC.parsePrice`: aceita `2,5`, `2.5 €`, `€ 2,50`, `1.250,00`, `1,250.00`. |
| 🟡 | CSV com `\r\n` deixava `\r` na última coluna; aspas duplicadas (`""`) mal tratadas | `split(/\r?\n/)`, BOM removido, `""` dentro de aspas tratado. IDs em falta/duplicados na sheet já não colidem. |
| 🟡 | `onclick` com interpolação de strings | Tudo via `addEventListener` + `data-*` (ver XSS). |
| 🟡 | `populateTableSelects` reconstruía 3 selects a cada sync | Só reconstrói quando o nº de mesas muda; a mesa selecionada é mantida (ou reposta se deixou de existir). |
| 🟡 | CSS/JS duplicados entre páginas | `assets/common.css` (tokens, reset) e `assets/common.js` (helpers) partilhados pelas três páginas. |
| 🟡 | Acessibilidade | `<label for>` em todos os selects/inputs, `aria-label` nos botões +/−/✕, `aria-live` na barra de ligação, toasts e contadores, `role="dialog"` nos painéis, botões reais em vez de `<span onclick>`. |
| 🟡 | Listener de clique para o AudioContext corria para sempre | Remove-se sozinho assim que o contexto está `running`. |
| 🟡 | Painel re-renderizava todos os cartões a cada snapshot (lista "salta" debaixo do dedo) | Render *keyed*: cada cartão tem `data-num` e uma assinatura; só muda o HTML dos que mudaram e só move os que mudaram de posição. |

## Também incluído

- `?t=<base64>` na raiz (`/?t=MQ==`) encaminha para `menu/?t=MQ==` — URLs de QR mais curtos.
- URL do menu configurável no painel só se um dia o menu mudar de sítio; por omissão é a pasta `menu/` ao lado.
- Timeouts (10–15 s) em todas as operações de rede do painel e do menu, com mensagens em português.
- `noindex` no painel.

## O que fica por fazer (fora do âmbito de ficheiros estáticos)

- Limpeza automática do `archive/` ou dos pedidos (precisa de uma Cloud Function agendada ou de um script) — para já é manual com 🧹 Arquivar.
- Um cliente malicioso ainda consegue criar pedidos falsos (por desenho: fazer pedidos sem login é o objetivo). Se se tornar um problema, a opção seguinte é Firebase Anonymous Auth + App Check, que não cabe em HTML estático sem alguma configuração extra.
- Não testei num browser real (sem npm nesta máquina): a sintaxe e os helpers foram verificados em Node; a lógica de auth/regras foi revista à mão. Faz um teste completo (regras → login → guardar config → pedido no telemóvel → entregue → arquivar) antes de imprimir QR codes.
