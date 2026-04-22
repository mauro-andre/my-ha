# PRD — Automations as Graph

**Status:** Draft 1
**Owner:** @mauro

## 1. Contexto

O modelo atual de automations é `trigger + conditions + actions + scenes` executados linearmente. Funciona bem pro caso "quando X, faz Y imediatamente", mas cai curto pra qualquer coisa que envolva:

- Sequência temporal ("liga AC, 10min depois muda temperatura, 10min depois desliga").
- Branching condicional ("se quarto acima de 24°, baixa pra 18; senão mantém").
- Paralelismo ("ao chegar em casa, liga luzes da sala E inicia rotina de climatização, sem um esperar o outro").
- Composição reutilizável (uma rotina complexa que varias automations possam disparar).

Hoje o usuário simula isso com N automations independentes com horários absolutos. Fica frágil, difícil de manter, e impossível de raciocinar visualmente.

## 2. Visão

Automation passa a ser um **grafo direcionado de nodes**, editado visualmente em canvas, estilo n8n / Node-RED / Apple Shortcuts. O grafo define o fluxo de execução: trigger entra por uma ponta, dispara uma cadeia de nodes ligados por edges, com possibilidade de delays, condicionais, paralelismos.

Todo o comportamento atual do app é expressível como grafo (`trigger → action` ou `trigger → scene`), então nenhum user-flow regride — só ganha expressividade.

**Slogan interno:** "Cada automação é uma pequena máquina de estados que você desenha."

## 3. Não-objetivos

- **Programação geral / Turing-completa.** Não queremos linguagem de expressão rica, scripts JS inline, loops arbitrários. O escopo é orquestração de eventos caseiros.
- **Colaboração em tempo real.** Um usuário edita por vez.
- **Versionamento / histórico de edições.** MVP nem guarda revisões antigas.
- **Execução distribuída.** Roda num processo só, sem cluster.
- **Mobile-first no editor.** Canvas é pensado desktop. Mobile vê e dispara automations, mas edita com dificuldade (aceitável).

## 4. Usuários & jornadas principais

### Jornada A — Automação simples (caso atual)
> "Quando a porta abre, liga a luz da sala."

Cria automação com 2 nodes: **Trigger (device_state)** → **Action (device_command)**. Salva. Funciona igual hoje.

### Jornada B — Sequência temporal (o caso que motivou)
> "Amanhã às 7h: AC a 20°, +10min 22°, +10min desliga, +10h luz acende."

**Trigger (schedule once)** → **Action (AC=20°)** → **Delay(10min)** → **Action (AC=22°)** → **Delay(10min)** → **Action (AC off)** → **Delay(10h)** → **Action (lights on)**.

### Jornada C — Condicional
> "Às 22h, se alguém tá na sala, só dim das luzes pra 30%. Se não, apaga tudo."

**Trigger (schedule daily 22:00)** → **Condition (sala.occupancy === true)** → true: **Action (dim 30%)**, false: **Scene (night off)**.

### Jornada D — Paralelismo
> "Quando chego em casa, simultaneamente: rotina de climatização + rotina de iluminação."

**Trigger (device_state chegada)** → **Parallel** → (branch 1: Scene "climatização") + (branch 2: Scene "iluminação").

### Jornada E — Composição
> "Rotina 'Acordar' referenciada em 2 automations diferentes (dias úteis / fim de semana com horários distintos)."

Resolvido hoje via Scenes. Continua funcionando. Automation pode referenciar scene como node.

## 5. Modelo de dados

### Schema da Automation

```typescript
automationSchema = dbSchema({
    name: z.string(),
    enabled: z.boolean(),
    nodes: z.array(nodeSchema),
    edges: z.array(edgeSchema),

    // Telemetria
    lastTriggeredAt: z.date().nullable().optional(),
    triggerCount: z.number(),
});

nodeSchema = embeddedSchema({
    id: z.string(),                    // nanoid/uuid local ao grafo
    type: z.enum([
        "trigger_schedule",
        "trigger_timer",
        "trigger_device_state",
        "action_device",
        "action_ir",
        "scene",
        "delay",
        "condition",
        "parallel",
        "merge",
    ]),
    config: z.record(z.any()),         // payload específico por type (validado por type)
    position: z.object({ x: z.number(), y: z.number() }),
});

edgeSchema = embeddedSchema({
    id: z.string(),
    from: z.string(),                  // source nodeId
    fromPort: z.string().default("out"),   // "out" | "true" | "false" | "out_N"
    to: z.string(),                    // target nodeId
    toPort: z.string().default("in"),
});
```

`config` é discriminado por `type` — cada tipo tem seu sub-schema validado no service layer. Mantém schema do Mongo flexível sem perder type safety no código.

### Invariantes

- Exatamente um node de tipo `trigger_*`. É o ponto de entrada do grafo.
- Todo node não-trigger tem pelo menos 1 edge entrante (exceto em futuras versões com múltiplos triggers).
- Sem ciclos. Validado no save.
- `parallel` emite N edges; `merge` aceita N edges; ambos balanceiam.

## 6. Tipos de nodes — especificação

| Tipo | Config | Entradas | Saídas | Descrição |
|------|--------|----------|--------|-----------|
| `trigger_schedule` | `{ time, days[] }` | — | `out` | Dispara em horário cron-like. |
| `trigger_timer` | `{ seconds, executeAt }` | — | `out` | Dispara N segundos após criação (one-shot). |
| `trigger_device_state` | `{ ieeeAddress, property, operator, value }` | — | `out` | Dispara em mudança de estado de device. |
| `action_device` | `{ ieeeAddress, property, value }` | `in` | `out` | Envia comando pra device Zigbee. |
| `action_ir` | `{ blasterIeee, code }` | `in` | `out` | Envia código IR. |
| `scene` | `{ sceneId }` (relation) | `in` | `out` | Executa scene completa (com seu próprio stagger interno). |
| `delay` | `{ seconds }` | `in` | `out` | Espera N segundos antes de continuar. |
| `condition` | `{ conditions: Condition[] }` | `in` | `true`, `false` | Avalia condições; escolhe branch. |
| `parallel` | `{}` | `in` | `out_1`, `out_2`, ... (N ≥ 2) | Dispara todas saídas simultaneamente. |
| `merge` | `{ expression: BoolExpr }` | portas nomeadas (N ≥ 2) | `out` | Emite em `out` quando a expressão booleana sobre o estado das portas resolve `true`. Ver §6.1. |

Conditions dentro do node `condition` reusa `conditionSchema` (device_state, time_range) que já temos.

### 6.1 Merge com expressão booleana

Merge não é só "all" ou "any" — aceita expressões compostas sobre suas portas de entrada, tipo `(A or B) and (C and D)`.

**Formato:**
```typescript
type BoolExpr =
    | { op: "and", args: BoolExpr[] }
    | { op: "or",  args: BoolExpr[] }
    | { op: "not", arg: BoolExpr }
    | { port: string };               // folha: referência a uma porta de entrada
```

**Presets** (açúcar sintático):
- `"all"` → `{ op: "and", args: [{port: "A"}, {port: "B"}, ...] }`
- `"any"` → `{ op: "or", args: [...] }`
- `"at_least_n"` → expansão combinatória.

**Estados das portas durante execução:**
- `pending` — ainda não decidiu.
- `fired` — edge de entrada disparou.
- `skipped` — upstream bifurcou (via `condition`/`parallel`) e definitivamente não vai chegar.

Merge avalia a expressão quando todas as portas referenciadas resolveram (fired ou skipped). Se `true` → emite em `out`. Se `false` → não emite; branches downstream não executam.

**Implicação no engine:** precisa propagar eventos de **skip** além de fire. Quando um `condition` emite em `true`, também emite `skip` em `false` pra tudo downstream que dependia daquela branch. Complexidade adicional, mas controlada.

**UI do merge:**
- Modo simples: dropdown de preset (`All inputs` / `Any input` / `At least N of`).
- Modo avançado: query-builder visual com grupos aninhados (botão `+ group` pra adicionar parênteses).
- Fallback: textarea "Paste expression" — parser aceita `and` / `or` / `not` / parênteses / nomes de portas.

## 7. Motor de execução

### Por instância rodando

Cada disparo cria uma **AutomationInstance** efêmera com:

```typescript
{
    automationId: string,
    startedAt: Date,
    nodeStates: Map<nodeId, "pending" | "running" | "completed" | "skipped">,
    pendingTimers: Map<nodeId, NodeJS.Timeout>,     // pra delay nodes
    pendingMerges: Map<nodeId, Set<inboundEdgeId>>, // pra merge nodes
}
```

### Fluxo

1. Trigger dispara → emite evento no seu edge `out`.
2. Engine processa cada edge recebendo evento:
   - Marca destino como `running`.
   - Executa side-effect (publish MQTT, await delay, avaliar condition).
   - Ao completar, emite nas saídas apropriadas.
3. `parallel` emite em N saídas no mesmo tick; `merge` acumula até satisfazer estratégia, depois emite.
4. `condition` emite em `true` ou `false`, nunca nos dois.
5. Quando não há mais nodes running ou pending, instância termina.

### Persistência entre restarts

Problema: `delay(10h)` precisa sobreviver a restart do servidor.

Duas estratégias:

**A) Persistir instâncias em collection separada (`automation_instances`).**
Cada delay salva `{ instanceId, nodeId, fireAt }`. No boot, varre instâncias, reagenda os delays futuros (skip os passados).

**B) Stateless: só os delays persistem como "mini timers".**
Em vez de persistir a instância inteira, persiste cada delay pendente como "scheduled continuation". No boot, reagenda. Quando o delay dispara, reanima a instância parcialmente (resolve o node atual pelo snapshot do grafo atual).

**Decisão preliminar:** **A**. Mais simples de raciocinar, permite mostrar "instância rodando" na UI em tempo real. Custo: writes no DB a cada transição. Aceitável pro volume esperado (dezenas de automations, cada uma disparando poucas vezes por dia).

### Missed steps

Server tava off quando delay deveria disparar. Política padrão:
- **Skip e log.** "Automation X step Y perdeu a janela de disparo por Z segundos — pulado."
- Visualmente marca a instância como "partially completed" na UI de histórico.

### Múltiplas instâncias concorrentes

Automação longa ainda rodando quando trigger dispara de novo.
- **Padrão: permitir** (instâncias paralelas).
- Config no nível da automation: `concurrencyPolicy: "allow" | "skip_if_running" | "cancel_previous"`.
- Default `"allow"` porque casos como "botão smart que dispara rotina curta" devem poder empilhar.

## 8. UI / UX

### Layout geral da página de edit

Três colunas:

```
┌──────────┬───────────────────────────┬──────────────┐
│          │                           │              │
│ Sidebar  │    Canvas                 │  Right panel │
│ (nav)    │    (grafo)                │  (contextual)│
│          │                           │              │
│          │                           │              │
└──────────┴───────────────────────────┴──────────────┘
```

- **Sidebar esquerda:** o mesmo sidebar de navegação do app (Home, Devices, Scenes, etc). Não muda aqui.
- **Canvas central:** o grafo, ocupando todo espaço disponível. Pan/zoom com mouse.
- **Painel direito (contextual):** muda de conteúdo conforme a seleção.
    - **Nenhum node selecionado:** mostra a **palette de node types** — lista vertical categorizada (Triggers / Actions / Flow control). Cada item arrasta pro canvas pra criar um novo node. Busca no topo ajuda em coleção grande.
    - **Um node selecionado:** mostra **o form de configuração desse node** — campos dinâmicos por `type` (device picker, scene picker, delay input, condition builder, merge expression builder). Botão "Delete" no fim.
    - **Uma edge selecionada (opcional, fase 3+):** mostra metadata da edge (label true/false pra condition, etc).

### Regras de edição

- **Drag-to-connect:** arrastar de um port de saída pra um port de entrada cria edge. Cursor indica se o destino é válido.
- **Delete de node:** remove o node E **todas as edges** conectadas a ele (entrada e saída). Sem confirmação pra node isolado; com confirm modal quando há 2+ edges conectadas.
- **Delete de edge:** apaga só a edge.
- **Validação visual:**
    - Node com **configuração incompleta** (campos required em branco) → **borda vermelha**.
    - Node com **conexões faltando** (sem edge entrante quando precisa, sem edge em alguma saída obrigatória) → **borda vermelha**.
    - Node com **ciclo detectado** → borda vermelha em todos os nodes do ciclo.
    - Tooltip no hover explica o motivo.
- **Save desabilitado** enquanto houver algum node com borda vermelha. Mensagem "N issues — fix before saving" indica o total.
- **Auto-save opcional** (stretch): se o grafo tá válido, salva em background com debounce.

### Estilo visual

- Nodes por categoria:
    - **Trigger** (azul) — formato com "chanfro" à esquerda indicando "ponto de entrada".
    - **Action** (verde) — retangular padrão.
    - **Scene** (ciano) — retangular com ícone da scene.
    - **Delay** (amarelo) — retangular com ícone de relógio + tempo formatado ("10 min").
    - **Condition** (roxo) — losango clássico de fluxograma; duas saídas com labels "true" (verde) / "false" (vermelho).
    - **Parallel** / **Merge** (cinza) — formato distinto pra diferenciar de action.
- Ports como círculos pequenos nas bordas; saída à direita, entrada à esquerda (com exceção de parallel/merge que podem ter múltiplos em cada lado).
- Minimap canto inferior direito.
- Grid de fundo sutil pra âncora visual.

### Auto-layout

Ao abrir automation migrada ou importada, rodar auto-layout uma vez (ELK.js ou Dagre) pra posicionar os nodes em colunas/linhas legíveis. Depois disso, posições são manuais e persistidas no save.

Botão "Auto-layout" no toolbar pra reorganizar manualmente.

### Componentes reusáveis

Formulários dentro do painel direito reusam máximo possível do que já temos:
- Device picker (já existe em ActionsEditor).
- Scene picker (já existe em SceneRefsEditor).
- Condition builder (precisa extrair do AutomationEdit atual).
- Time picker, day-of-week picker (já existem em AutomationEdit).

### Execução ao vivo (stretch)

Quando uma instância roda, nodes ativos pulsam. Edges acendem ao propagar. **Event stream** (via velojs streams que já temos) alimenta isso — backend emite `{ instanceId, nodeId, status }` e UI atualiza.

### Lista `/automations`

Card mostra preview reduzido do grafo (SVG estático gerado no save) + status (enabled, running instances count, last run). Click abre editor.

## 9. Migração

Automações antigas (schema linear atual) → automações graph:

```typescript
function migrateLinearToGraph(old: OldAutomation): NewAutomation {
    const triggerNode = { id: "trigger", type: triggerTypeFrom(old.trigger), config: old.trigger, position: { x: 0, y: 0 } };
    const nodes = [triggerNode];
    const edges = [];

    let prevId = triggerNode.id;
    let y = 100;

    // Conditions se houver viram um único node condition no início
    if (old.conditions?.length) {
        const condNode = { id: "cond", type: "condition", config: { conditions: old.conditions }, position: { x: 0, y } };
        nodes.push(condNode);
        edges.push({ from: prevId, to: condNode.id, fromPort: "out", toPort: "in" });
        prevId = condNode.id;
        // "false" path não leva a nada (short-circuit)
    }

    for (const action of old.actions ?? []) {
        const n = { id: `a${y}`, type: "action_device" | "action_ir", config: action, position: { x: 0, y: y += 100 } };
        nodes.push(n);
        edges.push({ from: prevId, to: n.id, fromPort: prevId === "cond" ? "true" : "out", toPort: "in" });
        prevId = n.id;
    }

    for (const scene of old.scenes ?? []) {
        const n = { id: `s${y}`, type: "scene", config: { sceneId: scene.id }, position: { x: 0, y: y += 100 } };
        nodes.push(n);
        edges.push({ from: prevId, to: n.id, fromPort: "out", toPort: "in" });
        prevId = n.id;
    }

    return { ...old, nodes, edges };
}
```

Rodado uma vez no deploy. Em dev, quase instantâneo.

## 10. Fases

### Fase 1 — Fundação (2-3 ciclos)
- Schema novo (nodes/edges).
- Migration do schema linear.
- Engine de execução topológica sem UI nova (UI atual continua funcionando mas por baixo chama engine nova).
- Persistência de instâncias.
- Retro-compatibilidade: seguir suportando só "linha reta" internamente.

### Fase 2 — Canvas editor (3-4 ciclos)
- Spike: validar react-flow via preact/compat no velojs.
- Editor canvas lado a lado com UI antiga (feature flag ou rota separada).
- Node palette + drag/drop + connect.
- Nodes: trigger, action, scene, delay.
- Save/load do grafo.
- Deprecar UI linear quando canvas estiver estável.

### Fase 3 — Branching (2 ciclos)
- Node `condition` com dois outputs.
- Engine trata short-circuit.
- UI: labels e cores nas edges de saída.

### Fase 4a — Paralelismo básico (1-2 ciclos)
- Node `parallel` (single-input → N outputs simultâneos).
- Node `merge` com presets `all` / `any`.
- Engine multi-branch sem skip-propagation (merge só conta fires).

### Fase 4b — Merge com expressão (1-2 ciclos)
- Engine passa a propagar eventos de skip.
- Merge aceita `BoolExpr` completa (AND/OR/NOT/nested).
- UI: query-builder visual + fallback textarea.

### Fase 5 — Polish e execução ao vivo (2 ciclos)
- Event stream de execução.
- Animação ao vivo no canvas.
- Histórico de execuções por automation.
- Templates prontos ("Rotina manhã", "Modo cinema", etc).

**Total estimado:** 12-16 ciclos de conversa.

## 11. Decisões em aberto

Questões que precisam alinhamento antes de executar cada fase:

1. **Múltiplas automations podem compartilhar sub-grafos?** (equivalente a função/sub-workflow). MVP: não — cada automation é self-contained. Scenes já cobrem parte disso.
2. **Podemos ter múltiplos triggers num mesmo grafo?** MVP: não — exatamente 1 trigger. Se precisar, cria 2 automations.
3. **Loops** (`while`, `for`)? MVP: não. Casos reais são raros; se aparecer, adiciona depois.
4. **Error handling — o que acontece se um node falha (device offline, scene deletada)?** MVP: log + skip + continua no próximo. Fase futura: node explícito `on_error` como saída extra.
5. **Templates.** Automações pré-prontas que o user pode importar/clonar. Nice-to-have na fase 5.
6. **Export/import** (JSON/YAML). Stretch. Útil pra backup/compartilhamento.
7. **Undo/redo no editor.** Stretch. Começa sem, adiciona se for faltar demais.

## 12. Critérios de sucesso

MVP considerado pronto quando:

- Caso B (sequência temporal do exemplo original) executável e editável por canvas.
- Caso C (condicional) executável.
- Caso D (paralelismo) executável.
- Todas automations antigas migradas e rodando sem regressão.
- Editor canvas mobile-somente-leitura aceitável (não quebra mobile, mas não precisa editar).
- Execução persistente sobrevive a restart (teste: cria automation com delay 24h, restart server, delay dispara no horário certo).

---

## Próximo passo

Spike técnico curto (~1 ciclo): validar se `react-flow` roda via `preact/compat` no nosso setup de velojs. Se sim, fase 1 começa. Se não, decidir entre buscar alternativa Preact-nativa ou refatorar pra React-compat em partes isoladas (só o editor).

Me revisa esse PRD: o que tá além, o que tá aquém, o que decidir diferente?
