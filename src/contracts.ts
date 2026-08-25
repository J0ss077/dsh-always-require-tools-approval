/**
 * Self-declared mirrors of the DeepSeek Harness contracts this plugin depends
 * on. These are the *only* harness types the plugin touches, kept in one file
 * so a contract change upstream is fixed in exactly one place (locality).
 *
 * They mirror, rather than import, `@deepseek-ai/dsh-tools` and
 * `@deepseek-ai/dsh-settings`: those packages do not install cleanly from npm
 * (the transitive `@deepseek-ai/dsh-type-meta` is unpublished), and the plugin
 * needs only a two-field decision type and one settings method at runtime.
 * See `docs/adr/0001-self-declared-harness-contracts.md`.
 * @module @j0ss077/dsh-always-require-tools-approval/contracts
 */

/**
 * Pre-dispatch decision. `allow` runs the call; `deny` blocks it; `ask` is
 * resolved by the harness's approval service (one-shot) and otherwise denies.
 * Mirrors `@deepseek-ai/dsh-tools`'s `PreToolDecision`.
 */
export type PreToolDecision =
    | { kind: "allow" }
    | { kind: "deny"; reason: string }
    | { kind: "ask"; reason?: string };

/** Minimal view of a pending tool execution; this plugin reads only `name`. */
export interface ToolExecution {
    readonly name: string;
}

declare module "@deepseek-ai/cordis" {
    interface Events {
        "tools/pre-execute"(exec: ToolExecution, next: () => Promise<PreToolDecision>): Promise<PreToolDecision>;
    }
}

/** Settings-namespace id; a plain string at runtime (the harness brands it). */
export type SettingsNamespace = string;

/** Read-only owner scope returned by `settings.register`; this plugin uses only `get`. */
export interface SettingsScope<T> {
    /** The current resolved value (schema defaults, then `base`, then the user layer). */
    get(): T;
}

/** User-settings seam surface this plugin needs; mirrors `@deepseek-ai/dsh-settings`. */
export interface SettingsService {
    register<T>(ns: SettingsNamespace, schema: unknown, options?: { base?: Partial<T> }): SettingsScope<T>;
}
