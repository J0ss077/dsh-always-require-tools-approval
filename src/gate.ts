/**
 * The approval-gate policy in pure terms: decide whether one pending tool
 * execution must ask the user, without touching Cordis. Kept dependency-free so
 * the decision is testable in isolation; the harness-facing plumbing lives in
 * `index.ts` and the self-declared types in `contracts.ts`.
 * @module @j0ss077/dsh-always-require-tools-approval/gate
 */

import type { PreToolDecision, ToolExecution } from "./contracts.ts";

/** Tool names gated when neither the loader config nor settings name any. */
export const DEFAULT_TOOLS: readonly string[] = ["bash", "pwsh"];

/** Fixed approval prompt; deliberately not configurable. */
export const PROMPT = "Approve this tool execution?";

/** Resolved-settings view: the gate reads the current tool list from here. */
export interface ResolvedTools {
    readonly tools?: readonly string[];
}

/** A pre-execute gate: decide one execution, or delegate downstream via `next`. */
export type Gate = (exec: ToolExecution, next: () => Promise<PreToolDecision>) => Promise<PreToolDecision>;

/**
 * Build a gate over a live tool-list source. `readResolved` is called on every
 * execution so a runtime settings change takes effect immediately; when it
 * yields nothing (settings not mounted) the loader `config` applies, then the
 * built-in default. Gated tools ask; everything else delegates.
 */
export function createGate(readResolved: () => ResolvedTools | undefined, config: { readonly tools?: readonly string[] }): Gate {
    return (exec, next) => {
        const tools = readResolved()?.tools ?? config.tools ?? DEFAULT_TOOLS;
        if (tools.includes(exec.name)) {
            return Promise.resolve({ kind: "ask", reason: PROMPT });
        }
        return next();
    };
}
