#!/usr/bin/env node
/**
 * Dependency vulnerability gate.
 *
 * Runs `npm audit --json` against the project lockfile and exits non-zero when
 * a vulnerability at or above the configured threshold is found.
 *
 * Usage:
 *   node scripts/security-audit.mjs                # fails on critical
 *   node scripts/security-audit.mjs --level=high   # fails on high + critical
 */
import { spawnSync } from "node:child_process";

const LEVELS = ["info", "low", "moderate", "high", "critical"];

const levelArg = process.argv.find((a) => a.startsWith("--level="));
const threshold = (levelArg?.split("=")[1] ?? "critical").toLowerCase();

if (!LEVELS.includes(threshold)) {
  console.error(`Unknown level "${threshold}". Use one of: ${LEVELS.join(", ")}`);
  process.exit(2);
}

const thresholdIndex = LEVELS.indexOf(threshold);

const result = spawnSync("npm", ["audit", "--json", "--audit-level", threshold], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});

if (!result.stdout) {
  console.error("npm audit produced no output.");
  console.error(result.stderr || "");
  process.exit(2);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error("Could not parse npm audit output:");
  console.error(result.stdout.slice(0, 2000));
  process.exit(2);
}

const vulnerabilities = report.vulnerabilities ?? {};
const blocking = Object.values(vulnerabilities).filter(
  (v) => LEVELS.indexOf(v.severity) >= thresholdIndex,
);

const counts = report.metadata?.vulnerabilities ?? {};
console.log(`Dependency audit summary: ${LEVELS.map((l) => `${l}=${counts[l] ?? 0}`).join("  ")}`);

if (blocking.length === 0) {
  console.log(`No vulnerabilities at or above "${threshold}". Build gate passed.`);
  process.exit(0);
}

console.error(`\nBlocking vulnerabilities (>= ${threshold}):\n`);
for (const vuln of blocking) {
  const advisories = (vuln.via ?? [])
    .filter((v) => typeof v === "object")
    .map((v) => `      - ${v.title} (${v.url ?? "no url"})`)
    .join("\n");
  console.error(`  ${vuln.name} [${vuln.severity}]`);
  console.error(`    range: ${vuln.range}`);
  if (vuln.fixAvailable && typeof vuln.fixAvailable === "object") {
    console.error(
      `    fix: ${vuln.fixAvailable.name}@${vuln.fixAvailable.version}${
        vuln.fixAvailable.isSemVerMajor ? " (major upgrade)" : ""
      }`,
    );
  } else if (vuln.fixAvailable) {
    console.error("    fix: available via `npm audit fix`");
  } else {
    console.error("    fix: none published yet");
  }
  if (advisories) console.error(advisories);
  console.error("");
}

console.error(
  `Failing build: ${blocking.length} package(s) with ${threshold}+ severity vulnerabilities.`,
);
process.exit(1);
