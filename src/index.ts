/**
 * Require a one-shot user approval before configured tools execute.
 *
 * Installs a `tools/pre-execute` waterfall listener that returns `{ kind:
 * "ask" }` for every tool named in the config and delegates every other tool
 * via `next()`. The harness resolves `ask` only through the approval service,
 * so one approval authorizes one execution and a missing approval channel
 * degrades to denial — this plugin never auto-approves.
 *
 * The tool list is also registered as a user-settings namespace, so the
 * harness's settings document overrides `tools` at runtime.
 * @module @j0ss077/dsh-always-require-tools-approval
 */

import type { Context } from "@deepseek-ai/cordis";
import z from "@deepseek-ai/schemastery";

/**
 * Pre-dispatch decision, self-declared from the harness contract because
 * `@deepseek-ai/dsh-tools` does not install cleanly from npm (its transitive
 * dependency `@deepseek-ai/dsh-type-meta` is unpublished).
 */
export type PreToolDecision = { kind: "allow" } | { kind: "deny"; reason: string } | { kind: "ask"; reason?: string };

/** Minimal view of a pending tool execution; this plugin reads only `name`. */
export interface ToolExecution {
    readonly name: string;
}

declare module "@deepseek-ai/cordis" {
    interface Events {
        "tools/pre-execute"(exec: ToolExecution, next: () => Promise<PreToolDecision>): Promise<PreToolDecision>;
    }
}

/** Tool names gated when neither the loader config nor settings name any. */
const DEFAULT_TOOLS = ["bash", "pwsh"];

/** Fixed approval prompt; deliberately not configurable. */
const REASON = "Approve this tool execution?";

/** Settings namespace (lowercase kebab-case) this plugin's config lives under. */
const SETTINGS_NAMESPACE = "always-require-tools-approval";

/** Settings-namespace id; a plain string at runtime, typed for seam clarity. */
export type SettingsNamespace = string;

/** Read-only owner scope a settings registration returns. */
export interface SettingsScope<T> {
    /** The current resolved value (schema default, then `base`, then the user section). */
    get(): T;
}

/**
 * The user-settings service surface this plugin uses, self-declared because
 * `@deepseek-ai/dsh-settings` is not needed at runtime (the harness already
 * mounts the real service) and its transitive dependencies are not verified
 * installable.
 */
export interface SettingsService {
    register<T>(ns: SettingsNamespace, schema: unknown, options?: { base?: Partial<T> }): SettingsScope<T>;
}

/** Plugin display name. */
export const name = "always-require-tools-approval";

/** Plugin config: the tools that must be approved before they run. */
export interface Config {
    /** Tool names that must be approved before they run. */
    tools?: string[];
}

export const Config: z<Config> = z.object({
    tools: z.array(z.string()).default(DEFAULT_TOOLS),
});

export function apply(ctx: Context, config: Config): void {
    const settings = ctx.get("settings") as SettingsService | undefined;
    const scope = settings?.register(SETTINGS_NAMESPACE, Config, { base: config });
    ctx.on("tools/pre-execute", async (exec, next): Promise<PreToolDecision> => {
        const tools = (scope?.get() ?? config).tools ?? DEFAULT_TOOLS;
        if (!tools.includes(exec.name)) return next();
        return { kind: "ask", reason: REASON };
    });
}
