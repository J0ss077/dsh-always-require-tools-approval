# Contributing

Thanks for your interest in contributing.

## Setup

Requires Node.js >= 22.19 and pnpm 11.

```sh
pnpm install
```

## Scripts

- `pnpm build` — compile to `lib/` and normalize declaration specifiers.
- `pnpm typecheck` — type-check source and tests.
- `pnpm test` — run the test suite with `node --test`.

## Layout

- `src/contracts.ts` — self-declared harness types (see `docs/adr/`).
- `src/gate.ts` — the pure approval-gate policy.
- `src/index.ts` — plugin wiring (`apply`).

## Conventions

- Tests live in `tests/` and exercise behavior through public interfaces.
- Before opening a pull request, make sure `pnpm typecheck` and `pnpm test` pass.
