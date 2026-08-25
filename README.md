# @j0ss077/dsh-always-require-tools-approval

> **Stop. Confirm. Run.** A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that pauses the tools on your watchlist and waits for your explicit approval before every execution.

[![npm version](https://img.shields.io/npm/v/@j0ss077/dsh-always-require-tools-approval?color=4d6bfe)](https://www.npmjs.com/package/@j0ss077/dsh-always-require-tools-approval)
[![license: MIT](https://img.shields.io/badge/license-MIT-2ea44f)](./LICENSE)
[![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-339933)]()

## What it does

DSH runs your agent in a sandbox that blocks file **writes** — but not commands. `bash` can still read files, launch programs, and reach the network.

This plugin puts an **approval gate** between a tool and its execution. When the agent calls a tool on the watchlist, the harness pauses and asks before anything runs.

- Default watchlist: `bash` and `pwsh`.
- One approval = **one** execution. The next call asks again.
- Reject, cancel, or no approval channel → the tool is **blocked**.
- Every other tool is left untouched.

## Requirements

- A DSH profile with an approval service — the standard `web` (GUI) profile ships one.
- Node.js **>= 22.19**.

## Install

One command installs and activates the plugin (it ships as a bundle layer):

```sh
dsh plugin --profile web add @j0ss077/dsh-always-require-tools-approval
```

Then restart the GUI. Use a different `--profile` if you run under another one.

## Configure

One option: `tools` — the watchlist.

| Key     | Type       | Default            | Meaning                                           |
| ------- | ---------- | ------------------ | ------------------------------------------------- |
| `tools` | `string[]` | `["bash", "pwsh"]` | Tool names that require approval before they run. |

Override it at runtime without reinstalling. Edit `~/.dsh/settings.yaml` (`$DSH_HOME/settings.yaml` when set):

```yaml
always-require-tools-approval:
    tools: ["bash", "pwsh", "node"]
```

This file takes precedence over the value baked into the bundle.

## What you'll see

1. The agent calls a watched tool, e.g. `bash`.
2. Execution pauses: **"Approve this tool execution?"**
3. **Approve** → that single call runs. **Reject** → denied, and the agent is told you rejected it.

Every call prompts again — approving once never grants a blank check. The prompt text is fixed by design.

## Safety model

- **One-shot.** One approval authorizes exactly one execution.
- **Fail closed.** No approval channel (headless run, unmounted service) → the tool is **denied**, never silently allowed.
- **No auto-approve.** For a watched tool the plugin only asks; it never approves on its own.
- **No interference.** Unwatched tools delegate to the next plugin.

## Update & remove

```sh
dsh plugin --profile web update @j0ss077/dsh-always-require-tools-approval
dsh plugin --profile web remove @j0ss077/dsh-always-require-tools-approval
```

Restart the GUI after updating.

## Development

```sh
pnpm install
pnpm build      # compile and normalize .d.ts
pnpm typecheck  # type-check source + tests
pnpm test       # node --test
```

The plugin is three modules — `src/contracts.ts` (harness types), `src/gate.ts` (the gate policy), `src/index.ts` (wiring). See [ADR 0001](./docs/adr/0001-self-declared-harness-contracts.md) for why the harness types are self-declared.

## License

[MIT](./LICENSE)
