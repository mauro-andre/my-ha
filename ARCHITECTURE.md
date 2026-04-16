# Architecture

## Directory structure

```
app/
├── pages/                     # Page components (TSX)
├── modules/                   # Business modules
│   └── <module>/
│       ├── <module>.schemas.ts      # Zod schemas (source of truth for types)
│       ├── <module>.repository.ts   # DB read/write via zodMongo
│       ├── <module>.services.ts     # Business logic
│       └── <module>.actions.ts      # Entry points called by pages
├── mqtt/
│   ├── client.ts              # Mosquitto connection and reconnection
│   └── router.ts              # Dispatches MQTT messages → services
├── server.tsx                 # Initialization (MQTT, MongoDB)
├── client.tsx                 # Client-side initialization
├── client-root.tsx            # HTML shell
├── routes.tsx                 # Route tree
└── styles/                    # Global styles
```

## Data flow

### Frontend → Backend (user actions)

```
Page TSX (action_xxx / loader)
  → module.actions.ts
    → module.services.ts
      → module.repository.ts
        → zodMongo → MongoDB
```

### MQTT → Backend (device events)

```
Mosquitto (push via TCP)
  → mqtt/client.ts
    → mqtt/router.ts
      → module.services.ts
        → module.repository.ts
          → zodMongo → MongoDB
```

## Rules

- **Pages have no business logic.** The `action_xxx` and `loader` exports in TSX files only delegate to modules.
- **No database access without zodMongo.** All MongoDB access goes through the repository, which uses zodMongo with Zod validation.
- **Schemas are the source of truth.** TypeScript types are inferred from Zod schemas. Validation happens at entry (actions) and exit (repository).
- **Services contain business logic.** Actions and the MQTT router are entry points that call services. Services call repositories.
- **Modules are independent.** Each module has its own schemas, repository, services, and actions. Cross-module communication happens via services, never through direct repository access.
- **Always use vanilla-extract for styles.** Never use inline styles. Each component has a corresponding `.css.ts` file with styles defined via vanilla-extract.
- **Always use rem, never px.** All spacing, font sizes, border-radius, etc. must use `rem`.
- **All application code in English.** Variable names, comments, UI text, logs — everything in English.
- **Mobile-first, fully fluid layout.** No media queries. Use `clamp()`, `min()`, `max()`, flexbox, and CSS grid with `auto-fill`/`auto-fit` + `minmax()` to create layouts that adapt naturally to any screen size.
