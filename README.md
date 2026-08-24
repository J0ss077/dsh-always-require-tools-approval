# @j0ss077/dsh-always-require-tools-approval

Require a one-shot user approval before configured tools execute in DeepSeek
Harness.

The read-only file sandbox restricts file writes but not command execution:
`bash` can still read files, launch programs, and reach the network. This plugin
puts a gate between a tool and its execution instead.

## Behavior

- Installs a `tools/pre-execute` waterfall listener.
- A tool in the configured list always returns `{ kind: "ask" }` with the fixed
  prompt `Approve this tool execution?`.
- Every other tool delegates via `next()` and is left unchanged.
- The harness resolves `ask` only through the mounted approval service
  (`allowed-once`), so one approval authorizes exactly one execution.
- With no approval channel mounted, `ask` degrades to denial. The plugin never
  auto-approves and never denies on its own: it only asks or delegates.

## Config

| Key     | Type       | Default            | Description                                       |
| ------- | ---------- | ------------------ | ------------------------------------------------- |
| `tools` | `string[]` | `["bash", "pwsh"]` | Tool names that require approval before they run. |

The approval prompt is fixed and not configurable.

`tools` is also registered as the user-settings namespace
`always-require-tools-approval`, so it can be overridden at runtime in
`$DSH_HOME/settings.yaml`:

```yaml
always-require-tools-approval:
    tools: ["bash", "pwsh"]
```

## Install

The package ships a bundle layer, so `dsh plugin add` installs and activates it
in one step:

```sh
dsh plugin --profile web add @j0ss077/dsh-always-require-tools-approval
```

The bundle's `cordis.patch.yml` inserts one row:

```yaml
- insert:
      - id: always-require-tools-approval
        name: "@j0ss077/dsh-always-require-tools-approval"
        config:
            tools: ["bash", "pwsh"]
```

## Update

```sh
dsh plugin --profile web update @j0ss077/dsh-always-require-tools-approval
```

Restart the GUI to load the new build.

## Type resolution

`PreToolDecision` and the user-settings seam are self-declared in
`src/index.ts`. They mirror the harness contract instead of importing
`@deepseek-ai/dsh-tools` (whose transitive dependency
`@deepseek-ai/dsh-type-meta` is unpublished) or `@deepseek-ai/dsh-settings`
(not needed at runtime and not verified installable standalone).

## License

MIT
