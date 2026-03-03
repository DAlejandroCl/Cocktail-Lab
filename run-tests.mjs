#!/usr/bin/env node

/**
 * run-tests.mjs
 *
 * Runs the full Cocktail Lab test suite in the correct order:
 *   1. Unit — stores
 *   2. Unit — components, services, utils
 *   3. Accessibility
 *   4. Integration
 *   5. E2E (Playwright)
 *
 * Features:
 *   - Live output in the terminal while tests run
 *   - Simultaneously writes everything to reports/console.log
 *   - Continues through all stages even if one fails
 *   - Prints a colour-coded summary table at the end
 *   - Exits with code 1 if any stage failed (CI-friendly)
 *
 * Usage:
 *   node run-tests.mjs              # run all stages
 *   node run-tests.mjs --stage unit # run a single stage by name
 *   node run-tests.mjs --bail       # stop on first failure
 */

import { spawn }     from "node:child_process";
import { mkdirSync, createWriteStream, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ─────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────

const ROOT        = dirname(fileURLToPath(import.meta.url));
const REPORTS_DIR = resolve(ROOT, "reports");
const LOG_FILE    = resolve(REPORTS_DIR, "console.log");
const SUMMARY_FILE = resolve(REPORTS_DIR, "summary.json");

const IS_CI   = !!process.env.CI;
const BAIL    = process.argv.includes("--bail");
const ONLY    = (() => {
  const idx = process.argv.indexOf("--stage");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

// ─────────────────────────────────────────────
// Stage definitions
// ─────────────────────────────────────────────

const VITEST = IS_CI ? "npx vitest run" : "npx vitest run";
const PW     = "npx playwright test";

const STAGES = [
  {
    name:    "unit:stores",
    label:   "Unit — Stores",
    cmd:     `${VITEST} tests/unit/stores`,
    type:    "vitest",
  },
  {
    name:    "unit:components",
    label:   "Unit — Components, Services & Utils",
    cmd:     `${VITEST} tests/unit/components tests/unit/services tests/unit/utils`,
    type:    "vitest",
  },
  {
    name:    "accessibility",
    label:   "Accessibility (axe-core)",
    cmd:     `${VITEST} tests/accessibility`,
    type:    "vitest",
  },
  {
    name:    "integration",
    label:   "Integration",
    cmd:     `${VITEST} tests/integration`,
    type:    "vitest",
  },
  {
    name:    "e2e",
    label:   "E2E (Playwright)",
    cmd:     PW,
    type:    "playwright",
  },
];

// ─────────────────────────────────────────────
// Colours (disabled in CI)
// ─────────────────────────────────────────────

const c = {
  reset:  IS_CI ? "" : "\x1b[0m",
  bold:   IS_CI ? "" : "\x1b[1m",
  dim:    IS_CI ? "" : "\x1b[2m",
  green:  IS_CI ? "" : "\x1b[32m",
  red:    IS_CI ? "" : "\x1b[31m",
  yellow: IS_CI ? "" : "\x1b[33m",
  cyan:   IS_CI ? "" : "\x1b[36m",
  white:  IS_CI ? "" : "\x1b[37m",
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function timestamp() {
  return new Date().toTimeString().slice(0, 8);
}

function banner(text) {
  const line = "─".repeat(60);
  return `\n${c.cyan}${c.bold}${line}\n  ${text}\n${line}${c.reset}\n`;
}

/**
 * Runs a shell command, streaming stdout+stderr to the terminal
 * AND to the shared log file simultaneously.
 * Returns a Promise<{ code, durationMs }>.
 */
function runStage(cmd, logStream) {
  return new Promise((resolve) => {
    const start = Date.now();

    // Split the command string into executable + args.
    // On Windows, wrap in cmd /c so shell built-ins work.
    const isWindows = process.platform === "win32";
    const shell     = isWindows ? "cmd"     : "/bin/sh";
    const shellFlag = isWindows ? ["/c", cmd] : ["-c", cmd];

    const child = spawn(shell, shellFlag, {
      stdio: ["inherit", "pipe", "pipe"],
      env:   { ...process.env, FORCE_COLOR: "1" },
    });

    const forward = (chunk) => {
      process.stdout.write(chunk);
      logStream.write(chunk);
    };

    child.stdout.on("data", forward);
    child.stderr.on("data", forward);

    child.on("close", (code) => {
      resolve({ code: code ?? 1, durationMs: Date.now() - start });
    });

    child.on("error", (err) => {
      const msg = `\nFailed to start process: ${err.message}\n`;
      process.stderr.write(msg);
      logStream.write(msg);
      resolve({ code: 1, durationMs: Date.now() - start });
    });
  });
}

function formatDuration(ms) {
  if (ms < 1000)  return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(0).padStart(2, "0");
  return `${m}m${s}s`;
}

function printSummary(results, totalMs, logStream) {
  const line  = "═".repeat(60);
  const lines = [];

  lines.push(`\n${c.bold}${c.cyan}${line}`);
  lines.push(`  TEST SUITE SUMMARY`);
  lines.push(`${line}${c.reset}\n`);

  for (const r of results) {
    const icon     = r.skipped ? "⊘" : r.code === 0 ? "✔" : "✘";
    const colour   = r.skipped ? c.dim : r.code === 0 ? c.green : c.red;
    const status   = r.skipped ? "SKIPPED" : r.code === 0 ? "PASSED " : "FAILED ";
    const duration = r.skipped ? "—" : formatDuration(r.durationMs);
    const label    = r.label.padEnd(40, " ");
    lines.push(`  ${colour}${icon} ${status}${c.reset}  ${label} ${c.dim}${duration}${c.reset}`);
  }

  const failed  = results.filter((r) => !r.skipped && r.code !== 0).length;
  const passed  = results.filter((r) => !r.skipped && r.code === 0).length;
  const skipped = results.filter((r) =>  r.skipped).length;

  lines.push(`\n${c.dim}${"─".repeat(60)}${c.reset}`);
  lines.push(
    `  ${c.green}${passed} passed${c.reset}` +
    (failed  ? `  ${c.red}${failed} failed${c.reset}`   : "") +
    (skipped ? `  ${c.dim}${skipped} skipped${c.reset}` : "") +
    `  ${c.dim}total ${formatDuration(totalMs)}${c.reset}`
  );
  lines.push(`\n  Reports saved to:  ${c.cyan}reports/${c.reset}`);

  if (failed === 0) {
    lines.push(`\n  ${c.green}${c.bold}All stages passed.${c.reset}`);
  } else {
    lines.push(`\n  ${c.red}${c.bold}${failed} stage(s) failed. Check reports/console.log for details.${c.reset}`);
  }

  lines.push(`${c.dim}${"═".repeat(60)}${c.reset}\n`);

  const output = lines.join("\n");
  process.stdout.write(output);
  logStream.write(output);
}

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────

async function main() {
  // Prepare the reports directory and log stream
  mkdirSync(REPORTS_DIR, { recursive: true });

  const logStream = createWriteStream(LOG_FILE, { flags: "w" });

  const header = [
    `Cocktail Lab — Full Test Suite`,
    `Started: ${new Date().toLocaleString()}`,
    `Platform: ${process.platform} | Node: ${process.version}`,
    `CI: ${IS_CI}`,
    `${"─".repeat(60)}`,
  ].join("\n") + "\n";

  process.stdout.write(`\n${c.bold}${c.cyan}${header}${c.reset}`);
  logStream.write(header);

  // Determine which stages to run
  const stages = ONLY
    ? STAGES.filter((s) => s.name === ONLY || s.type === ONLY)
    : STAGES;

  if (ONLY && stages.length === 0) {
    console.error(`\nUnknown stage: "${ONLY}". Valid names: ${STAGES.map((s) => s.name).join(", ")}\n`);
    process.exit(1);
  }

  const results = [];
  const totalStart = Date.now();
  let anyStageFailed = false;

  for (const stage of STAGES) {
    // If this stage is not in the selected set, mark it skipped
    if (!stages.includes(stage)) {
      results.push({ ...stage, code: 0, durationMs: 0, skipped: true });
      continue;
    }

    // Bail early if requested and a previous stage failed
    if (BAIL && anyStageFailed) {
      results.push({ ...stage, code: 1, durationMs: 0, skipped: true });
      continue;
    }

    const msg = banner(`[${timestamp()}]  ${stage.label}`);
    process.stdout.write(msg);
    logStream.write(msg);

    const { code, durationMs } = await runStage(stage.cmd, logStream);

    results.push({ ...stage, code, durationMs, skipped: false });

    const result = code === 0
      ? `${c.green}✔ Passed${c.reset} in ${formatDuration(durationMs)}\n`
      : `${c.red}✘ Failed${c.reset} (exit ${code}) in ${formatDuration(durationMs)}\n`;

    process.stdout.write(result);
    logStream.write(result);

    if (code !== 0) anyStageFailed = true;
  }

  const totalMs = Date.now() - totalStart;

  printSummary(results, totalMs, logStream);

  // Write machine-readable summary
  const summary = {
    date:     new Date().toISOString(),
    totalMs,
    passed:   results.filter((r) => !r.skipped && r.code === 0).length,
    failed:   results.filter((r) => !r.skipped && r.code !== 0).length,
    skipped:  results.filter((r) =>  r.skipped).length,
    stages:   results.map(({ name, label, code, durationMs, skipped }) => ({
      name, label, code, durationMs, skipped,
      status: skipped ? "skipped" : code === 0 ? "passed" : "failed",
    })),
  };

  writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));

  logStream.end();

  process.exit(anyStageFailed ? 1 : 0);
}

main().catch((err) => {
  console.error("Unexpected error in run-tests.mjs:", err);
  process.exit(1);
});
