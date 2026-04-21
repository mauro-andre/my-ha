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
│       ├── <module>.actions.ts      # Entry points called by pages
│       └── <module>.stream.ts       # (Optional) Event streams (SSE) for push-to-client
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

### Backend → Frontend (real-time push)

```
module.services.ts (state change, listener fires)
  → module.stream.ts (source callback emits)
    → velojs event stream (SSE)
      → useEventStream hook (client)
        → Page TSX reacts (refetch, signal update)
```

## Event streams (SSE)

Real-time server → client updates use **velojs event streams**. No manual SSE routes, no raw `EventSource`.

- Each stream lives in its own `<module>/<module>.stream.ts` file.
- Declared with `createEventStream` from `@mauroandre/velojs`.
- Cross-cutting streams (consumed from multiple pages) are **standalone** (`path: "/api/..."`, `broadcast: true` or `channel` resolver).
- Page-scoped streams use the `stream_*` convention (named export inside a page module) — path is auto-derived from the module.
- The `source` callback is how the stream bridges into service-level listeners (e.g. `onStateChange`). It runs only while there are active subscribers; the `AbortSignal` fires when the last one disconnects, so listeners can unsubscribe cleanly.
- Server-only deps inside `source` must be loaded via dynamic `import()` to keep the client bundle slim.
- On the client, subscribe with `useEventStream(stream, { channel? })` from `@mauroandre/velojs/hooks` — it manages the `EventSource` lifecycle and exposes `data`, `snapshot`, `closed`, `error` signals.

```typescript
// module.stream.ts
export const deviceStateStream = createEventStream<DeviceStateChange>({
    path: "/api/devices/events",
    broadcast: true,
    source: async (emit, { abortSignal }) => {
        const { onStateChange } = await import("./device.services.js");
        const unsubscribe = onStateChange((ieeeAddress, changedKeys, state) => {
            emit({ ieeeAddress, changedKeys, state });
        });
        abortSignal.addEventListener("abort", () => unsubscribe());
        await new Promise<void>((r) => abortSignal.addEventListener("abort", () => r()));
    },
});
```

```typescript
// Page.tsx
const { data } = useEventStream(deviceStateStream);
useSignalEffect(() => { if (data.value) refetch(); });
```

## Rules

- **Pages have no business logic.** The `action_xxx` and `loader` exports in TSX files only delegate to modules.
- **No database access without zodMongo.** All MongoDB access goes through the repository, which uses zodMongo with Zod validation.
- **Schemas are the source of truth.** TypeScript types are inferred from Zod schemas. Validation happens at entry (actions) and exit (repository).
- **Services contain business logic.** Actions and the MQTT router are entry points that call services. Services call repositories.
- **Modules are independent.** Each module has its own schemas, repository, services, and actions. Cross-module communication happens via services, never through direct repository access.
- **No manual SSE.** Real-time server → client updates always go through velojs event streams (`createEventStream` + `useEventStream`). Never register SSE routes by hand with `streamSSE`, and never open a raw `EventSource` on the client.
- **Always use vanilla-extract for styles.** Never use inline styles. Each component has a corresponding `.css.ts` file with styles defined via vanilla-extract.
- **Always use rem, never px.** All spacing, font sizes, border-radius, etc. must use `rem`.
- **All application code in English.** Variable names, comments, UI text, logs — everything in English.
- **Mobile-first, fully fluid layout.** No media queries. Use `clamp()`, `min()`, `max()`, flexbox, and CSS grid with `auto-fill`/`auto-fit` + `minmax()` to create layouts that adapt naturally to any screen size.
