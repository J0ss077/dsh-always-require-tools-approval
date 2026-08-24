import { test } from "node:test";
import assert from "node:assert/strict";
import { Context } from "@deepseek-ai/cordis";
import * as plugin from "../src/index.ts";
import type { Config, PreToolDecision } from "../src/index.ts";

const ALLOW: PreToolDecision = { kind: "allow" };

/** Register the plugin on a fresh context and wait for apply() to finish. */
async function mount(config?: Config): Promise<Context> {
    const ctx = new Context();
    await ctx.plugin(plugin, config ?? {});
    return ctx;
}

/** Dispatch tools/pre-execute for one tool and report whether next() ran. */
async function run(ctx: Context, tool: string): Promise<{ decision: PreToolDecision; delegated: boolean }> {
    let delegated = false;
    const decision = await ctx.waterfall("tools/pre-execute", { name: tool }, async () => {
        delegated = true;
        return ALLOW;
    });
    return { decision, delegated };
}

test("asks for a configured tool without delegating", async () => {
    const ctx = await mount({ tools: ["bash"] });
    const { decision, delegated } = await run(ctx, "bash");
    assert.deepEqual(decision, { kind: "ask", reason: "Approve this tool execution?" });
    assert.equal(delegated, false);
});

test("delegates an unconfigured tool via next()", async () => {
    const ctx = await mount({ tools: ["bash"] });
    const { decision, delegated } = await run(ctx, "read");
    assert.deepEqual(decision, ALLOW);
    assert.equal(delegated, true);
});

test("defaults tools to bash and pwsh", async () => {
    const ctx = await mount();
    assert.deepEqual((await run(ctx, "bash")).decision, { kind: "ask", reason: "Approve this tool execution?" });
    assert.deepEqual((await run(ctx, "pwsh")).decision, { kind: "ask", reason: "Approve this tool execution?" });
    assert.deepEqual((await run(ctx, "read")).decision, ALLOW);
});

test("reads the resolved settings value over the loader config", async () => {
    const ctx = new Context();
    ctx.provide("settings", {
        register: () => ({
            get: () => ({ tools: ["node"] }),
        }),
    });
    await ctx.plugin(plugin, { tools: ["bash"] });
    assert.deepEqual((await run(ctx, "node")).decision, { kind: "ask", reason: "Approve this tool execution?" });
    assert.deepEqual((await run(ctx, "bash")).decision, ALLOW);
});
