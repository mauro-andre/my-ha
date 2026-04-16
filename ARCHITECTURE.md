# Arquitetura

## Estrutura de diretórios

```
app/
├── pages/                     # Componentes de página (TSX)
├── modules/                   # Módulos de negócio
│   └── <modulo>/
│       ├── <modulo>.schemas.ts      # Schemas Zod (fonte de verdade dos tipos)
│       ├── <modulo>.repository.ts   # Leitura/escrita no Mongo via zodMongo
│       ├── <modulo>.services.ts     # Lógica de negócio
│       └── <modulo>.actions.ts      # Entry points chamados pelas pages
├── mqtt/
│   ├── client.ts              # Conexão e reconexão ao Mosquitto
│   └── router.ts              # Despacha mensagens MQTT → services
├── server.tsx                 # Inicialização (MQTT, MongoDB)
├── client.tsx                 # Inicialização client-side
├── client-root.tsx            # Shell HTML
├── routes.tsx                 # Árvore de rotas
└── styles/                    # Estilos globais
```

## Fluxo de dados

### Frontend → Backend (ações do usuário)

```
Page TSX (action_xxx / loader)
  → module.actions.ts
    → module.services.ts
      → module.repository.ts
        → zodMongo → MongoDB
```

### MQTT → Backend (eventos dos dispositivos)

```
Mosquitto (push via TCP)
  → mqtt/client.ts
    → mqtt/router.ts
      → module.services.ts
        → module.repository.ts
          → zodMongo → MongoDB
```

## Regras

- **Pages não têm lógica de negócio.** Os `action_xxx` e `loader` dentro dos TSX apenas delegam para os módulos.
- **Nada entra ou sai do banco sem zodMongo.** Todo acesso ao MongoDB passa pelo repository, que usa zodMongo com validação Zod.
- **Schemas são a fonte de verdade.** Tipos TypeScript são inferidos dos schemas Zod. Validação acontece na entrada (actions) e na saída (repository).
- **Services contêm a lógica de negócio.** Actions e o router MQTT são entry points que chamam services. Services chamam repositories.
- **Módulos são independentes.** Cada módulo tem seus próprios schemas, repository, services e actions. Comunicação entre módulos acontece via services, nunca via repository direto.
