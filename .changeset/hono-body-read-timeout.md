---
'@modelcontextprotocol/server': minor
'@modelcontextprotocol/hono': minor
---

Add an optional `bodyTimeoutMs` to `createMcpHonoApp` to bound JSON body arrival time. On expiry the middleware cancels both body branches and returns HTTP 408 with `Connection: close`. The deadline ends when body parsing finishes, so downstream handlers are unaffected. Omitting the option preserves the existing server timeout behavior.

`readRequestBody` accepts an optional `AbortSignal` to cancel a stalled read without waiting for source cancellation.
