# @j0ss077/dsh-always-require-tools-approval

> **Stop. Confirm. Run.** A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that pauses selected tools and waits for your explicit approval before every execution.

[![npm version](https://img.shields.io/npm/v/@j0ss077/dsh-always-require-tools-approval?color=4d6bfe)](https://www.npmjs.com/package/@j0ss077/dsh-always-require-tools-approval)
[![license: MIT](https://img.shields.io/badge/license-MIT-2ea44f)](./LICENSE)
[![node: >=22.19](https://img.shields.io/badge/node-%3E%3D22.19-339933)]()
[![DeepSeek Harness plugin](https://img.shields.io/badge/DeepSeek%20Harness-plugin-4d6bfe)]()

---

## What it does

DeepSeek Harness runs your agent inside a sandbox that blocks file **writes**, but **not** command execution. The `bash` tool can still read files, launch programs, and reach the network even when writes are locked down.

This plugin closes that gap by putting a **gate between a tool and its execution**. When the agent tries to run one of the tools on your watchlist, the harness pauses and asks you for permission first.

## At a glance

- Gates a **configurable list** of tools (default: `bash` and `pwsh`).
- Before a gated tool runs, the harness pauses and asks **“Approve this tool execution?”**.
- Approve once → **exactly that one execution** runs. The next call asks again.
- Reject, cancel, or no approval channel → the tool is **blocked**.
- Every other tool is **left untouched** (it delegates to the next plugin).
- It **never auto-approves** and **never denies on its own** — it only _asks_ or _steps aside_.

## Requirements

- A DeepSeek Harness profile that mounts an approval service — the standard `web` profile (the GUI) ships one out of the box.
- Node.js **>= 22.19** (the plugin's engine requirement).

## Installation

The package ships a **bundle layer**, so a single command both installs _and_ activates it:

```sh
dsh plugin --profile web add @j0ss077/dsh-always-require-tools-approval
```

> Use a different `--profile` name if you run DSH under another profile.

That command forwards to `pnpm` inside the profile directory and, on top of it, the bundle's `cordis.patch.yml` inserts the plugin into the profile:

```yaml
- insert:
    - id: always-require-tools-approval
      name: "@j0ss077/dsh-always-require-tools-approval"
      config:
        tools: ["bash", "pwsh"]
```

After installing, **restart the GUI** to load the new build.

## Configuration

There is exactly one option:

| Key     | Type       | Default            | Meaning                                           |
| ------- | ---------- | ------------------ | ------------------------------------------------- |
| `tools` | `string[]` | `["bash", "pwsh"]` | Tool names that require approval before they run. |

### Changing the list at runtime

`tools` is registered as the user-settings namespace `always-require-tools-approval`, so you can override it without reinstalling. Edit `$DSH_HOME/settings.yaml` (defaults to `~/.dsh/settings.yaml` when `$DSH_HOME` is unset):

```yaml
always-require-tools-approval:
    tools: ["bash", "pwsh"]
```

Your settings file takes precedence over the value baked into the bundle.

#### Examples

```yaml
# Gate only bash
always-require-tools-approval:
    tools: ["bash"]

# Gate bash, PowerShell, and Node together
always-require-tools-approval:
    tools: ["bash", "pwsh", "node"]
```

## What you'll see

1. The agent tries to call a gated tool, for example `bash`.
2. Execution pauses and you get a prompt: **“Approve this tool execution?”**
3. Choose the outcome:
    - **Approve** → that single call runs.
    - **Reject** → the call is denied and the agent is told you rejected it.

Every subsequent call to that tool prompts you again — approving once never grants a blank check.

## Safety model

- **One-shot.** One approval authorizes exactly one execution. The next call to the same tool asks again.
- **Fail closed.** If no approval channel is mounted — headless run, an agent-less call, or an unmounted service — the tool is **denied**, never silently allowed.
- **No auto-approve.** For a gated tool, this plugin returns `ask`; it never returns `allow` by itself.
- **No interference.** For every non-gated tool it calls `next()`, so other plugins keep working normally.

## Update

```sh
dsh plugin --profile web update @j0ss077/dsh-always-require-tools-approval
```

Restart the GUI to load the new build.

## Remove

```sh
dsh plugin --profile web remove @j0ss077/dsh-always-require-tools-approval
```

`add`, `update`, and `remove` all forward to `pnpm`, so any pnpm-style removal (`remove`, `rm`, `uninstall`) works.

---

## For developers

### Under the hood

The plugin installs a `tools/pre-execute` waterfall listener. For a tool named in `tools` it returns an `ask` decision; for everything else it delegates with `next()`:

```ts
ctx.on("tools/pre-execute", async (exec, next) => {
    const tools = (scope?.get() ?? config).tools ?? DEFAULT_TOOLS;
    if (!tools.includes(exec.name)) return next();
    return { kind: "ask", reason: "Approve this tool execution?" };
});
```

The harness resolves `ask` through its approval service. The outcome maps one-to-one:

| Outcome                    | Result                              |
| -------------------------- | ----------------------------------- |
| `allowed-once`             | the call runs                       |
| `rejected`                 | denied — the user rejected the tool |
| `cancelled`                | denied — the approval was cancelled |
| `unavailable` / no service | denied — fail closed                |

The `PreToolDecision` contract this plugin implements is:

```ts
type PreToolDecision = { kind: "allow" } | { kind: "deny"; reason: string } | { kind: "ask"; reason?: string };
```

### Type resolution note

`PreToolDecision` and the user-settings seam are **self-declared** in `src/index.ts`. They mirror the harness contract instead of importing `@deepseek-ai/dsh-tools` (whose transitive dependency `@deepseek-ai/dsh-type-meta` is unpublished) or `@deepseek-ai/dsh-settings` (not needed at runtime and not verified installable standalone).

### Building & testing

```sh
pnpm install
pnpm build      # compile with tsc
pnpm typecheck  # type-check including tests
pnpm test       # node --test "tests/**/*.test.ts"
```

## FAQ

**I installed it, but I don't see the approval prompt.** Confirm the plugin is active in your profile, make sure `settings.yaml` isn't clearing `tools`, and restart the GUI.

**Every gated tool now fails with “requires approval…”.** That means no approval service is mounted in the current context (for example, a headless run without the GUI). This is the plugin _working correctly_ — it fails closed rather than running unchecked.

**Can I change the prompt text?** No. The prompt is fixed by design so the gate stays predictable.

**Does one approval let the tool run several times?** No. Each execution prompts again — one approval, one run.

**Does this block other tools?** No. Only the tools listed in `tools` are gated; every other tool delegates normally.

## License

[MIT](./LICENSE)
