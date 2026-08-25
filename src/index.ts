/**
 * Require a one-shot user approval before configured tools execute.
 *
 * The plugin installs a `tools/pre-execute` listener that returns `{ kind:
 * "ask" }` for every tool in the resolved watchlist and delegates every other
 * tool via `next()`. The harness resolves `ask` only through its approval
 * service, so one approval authorizes one execution and a missing approval
 * channel degrades to denial — this plugin never auto-approves.
 *
 * The watchlist is registered as a user-settings namespace, so the harness's
 * settings document overrides `tools` at runtime. The pure gate policy lives in
 * `gate.ts`; the self-declared harness types live in `contracts.ts`.
 * @module @j0ss077/dsh-always-require-tools-approval
 */

import type { Context } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";
import type { SettingsService } from "./contracts.ts";
import { createGate, DEFAULT_TOOLS } from "./gate.ts";

export type { PreToolDecision, ToolExecution, SettingsNamespace, SettingsScope, SettingsService } from "./contracts.ts";

/** Plugin display name. */
export const name = "always-require-tools-approval";

/** Settings namespace (lowercase kebab-case) this plugin's config lives under. */
const SETTINGS_NAMESPACE = "always-require-tools-approval";

/** Plugin config: the tools that must be approved before they run. */
export interface Config {
    /** Tool names that must be approved before they run. */
    tools?: string[];
}

export const Config: z<Config> = z.object({
    tools: z.array(z.string()).default([...DEFAULT_TOOLS]),
});

export function apply(ctx: Context, config: Config): void {
    const settings = ctx.get("settings") as SettingsService | undefined;
    const scope = settings?.register(SETTINGS_NAMESPACE, Config, { base: config });
    ctx.on("tools/pre-execute", createGate(() => scope?.get(), config));
}
