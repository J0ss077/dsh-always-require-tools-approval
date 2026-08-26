import { test } from "node:test";
import assert from "node:assert/strict";
import { createGate, PROMPT } from "../src/gate.ts";
import type { PreToolDecision } from "../src/contracts.ts";

const ALLOW: PreToolDecision = { kind: "allow" };
const ASK: PreToolDecision = { kind: "ask", reason: PROMPT };

interface Options {
    config?: { tools?: string[] };
    resolved?: { tools?: string[] };
}

/** Build a gate plus a recorder so a test can observe whether `next()` ran. */
function harness(options: Options = {}) {
    let delegated = false;
    const gate = createGate(() => options.resolved, options.config ?? {});
    return async (name: string): Promise<{ decision: PreToolDecision; delegated: boolean }> => {
        delegated = false;
        const decision = await gate({ name }, async () => {
            delegated = true;
            return ALLOW;
        });
        return { decision, delegated };
    };
}

test("asks for a gated tool without delegating", async () => {
    const decide = harness({ config: { tools: ["bash"] } });
    assert.deepEqual(await decide("bash"), { decision: ASK, delegated: false });
});

test("delegates a non-gated tool via next()", async () => {
    const decide = harness({ config: { tools: ["bash"] } });
    assert.deepEqual(await decide("read"), { decision: ALLOW, delegated: true });
});

test("defaults the gated list to bash and pwsh", async () => {
    const decide = harness();
    assert.deepEqual(await decide("bash"), { decision: ASK, delegated: false });
    assert.deepEqual(await decide("pwsh"), { decision: ASK, delegated: false });
    assert.deepEqual(await decide("read"), { decision: ALLOW, delegated: true });
});

test("resolved settings override the loader config", async () => {
    const decide = harness({ config: { tools: ["bash"] }, resolved: { tools: ["node"] } });
    assert.deepEqual(await decide("node"), { decision: ASK, delegated: false });
    assert.deepEqual(await decide("bash"), { decision: ALLOW, delegated: true });
});

test("an empty gated list gates nothing", async () => {
    const decide = harness({ config: { tools: [] } });
    assert.deepEqual(await decide("bash"), { decision: ALLOW, delegated: true });
});

test("re-reads the watchlist on every call (runtime override applies hot)", async () => {
    const resolved = { tools: ["bash"] };
    let delegated = false;
    const gate = createGate(() => resolved, {});
    const decide = async (name: string): Promise<{ decision: PreToolDecision; delegated: boolean }> => {
        delegated = false;
        const decision = await gate({ name }, async () => {
            delegated = true;
            return ALLOW;
        });
        return { decision, delegated };
    };

    // Initially only bash is gated.
    assert.deepEqual(await decide("bash"), { decision: ASK, delegated: false });
    assert.deepEqual(await decide("node"), { decision: ALLOW, delegated: true });

    // Mutate the resolved list at runtime; the gate must pick it up immediately.
    resolved.tools = ["node"];
    assert.deepEqual(await decide("bash"), { decision: ALLOW, delegated: true });
    assert.deepEqual(await decide("node"), { decision: ASK, delegated: false });
});
