#!/usr/bin/env node

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const DEFAULT_VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

const PAGE_TIMEOUT_MS = 15_000;
const DEFAULT_SETTLE_MS = 500;

function usage() {
  console.log(`
Usage: node capture-screenshots.js [options] <path>

Capture PNG screenshots of HTML files at mobile and desktop viewports using Playwright.

Arguments:
  <path>    Path to an HTML file or a directory containing HTML files

Options:
  --dark              Also capture dark-mode variants (prefers-color-scheme: dark)
  --outdir <dir>      Output directory (default: screenshots/ next to input)
  --viewport <WxH>    Add a custom viewport (e.g. 768x1024). Can repeat.
  --no-full-page      Capture only the visible viewport (default: full page)
  --wait <ms>         Extra settle time after load (default: 500)
  --help              Show this help message

Examples:
  node capture-screenshots.js output/dating-app/screens/discover.html
  node capture-screenshots.js output/dating-app/screens/
  node capture-screenshots.js --dark --viewport 768x1024 output/storycraft/screens/
`);
}

function parseArgs(argv) {
  const opts = {
    darkMode: false,
    outDir: null,
    fullPage: true,
    settleMs: DEFAULT_SETTLE_MS,
    customViewports: {},
    targetPath: null,
  };

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === "--dark") {
      opts.darkMode = true;
    } else if (arg === "--outdir" && argv[i + 1]) {
      opts.outDir = argv[++i];
    } else if (arg === "--viewport" && argv[i + 1]) {
      const vp = argv[++i];
      const match = vp.match(/^(\d+)x(\d+)$/);
      if (!match) {
        console.error(`Error: invalid viewport format "${vp}". Use WxH (e.g. 768x1024)`);
        process.exit(1);
      }
      const label = `${match[1]}w`;
      opts.customViewports[label] = { width: parseInt(match[1]), height: parseInt(match[2]) };
    } else if (arg === "--no-full-page") {
      opts.fullPage = false;
    } else if (arg === "--full-page") {
      opts.fullPage = true;
    } else if (arg === "--wait" && argv[i + 1]) {
      opts.settleMs = parseInt(argv[++i]) || DEFAULT_SETTLE_MS;
    } else if (arg === "--help") {
      usage();
      process.exit(0);
    } else if (!arg.startsWith("--")) {
      opts.targetPath = arg;
    } else {
      console.error(`Unknown option: ${arg}`);
      usage();
      process.exit(1);
    }
    i++;
  }

  return opts;
}

function collectHtmlFiles(targetPath) {
  const resolved = path.resolve(targetPath);

  if (!fs.existsSync(resolved)) {
    console.error(`Error: path not found: ${resolved}`);
    process.exit(1);
  }

  const stat = fs.statSync(resolved);

  if (stat.isFile()) {
    if (!resolved.endsWith(".html")) {
      console.error(`Error: ${resolved} is not an HTML file`);
      process.exit(1);
    }
    return [resolved];
  }

  if (stat.isDirectory()) {
    const files = fs
      .readdirSync(resolved)
      .filter((f) => f.endsWith(".html"))
      .sort()
      .map((f) => path.join(resolved, f));

    if (files.length === 0) {
      console.error(`No HTML files found in: ${resolved}`);
      process.exit(1);
    }
    return files;
  }

  console.error(`Error: ${resolved} is not a file or directory`);
  process.exit(1);
}

async function captureFile(page, htmlPath, outDir, variant, viewports, opts) {
  const fileUrl = `file://${htmlPath}`;
  const baseName = path.basename(htmlPath, ".html");

  await page.emulateMedia({ colorScheme: variant === "dark" ? "dark" : "light" });

  const results = [];

  for (const [label, size] of Object.entries(viewports)) {
    await page.setViewportSize(size);
    await page.goto(fileUrl, { waitUntil: "load", timeout: PAGE_TIMEOUT_MS });

    try {
      await page.waitForLoadState("networkidle", { timeout: PAGE_TIMEOUT_MS });
    } catch {
      // Best-effort resource loading — timeout is acceptable
    }

    await page.waitForTimeout(opts.settleMs);

    const suffix = variant === "dark" ? `-${label}-dark` : `-${label}`;
    const outFile = path.join(outDir, `${baseName}${suffix}.png`);

    await page.screenshot({ path: outFile, fullPage: opts.fullPage });
    results.push(outFile);
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    usage();
    process.exit(0);
  }

  const opts = parseArgs(args);

  if (!opts.targetPath) {
    console.error("Error: no path provided");
    usage();
    process.exit(1);
  }

  const htmlFiles = collectHtmlFiles(opts.targetPath);
  const viewports = { ...DEFAULT_VIEWPORTS, ...opts.customViewports };

  const outDir = opts.outDir
    ? path.resolve(opts.outDir)
    : path.join(path.dirname(htmlFiles[0]), "screenshots");

  fs.mkdirSync(outDir, { recursive: true });

  const viewportLabels = Object.entries(viewports)
    .map(([k, v]) => `${k} (${v.width}px)`)
    .join(", ");

  console.log(`\nCapturing ${htmlFiles.length} HTML file(s)`);
  console.log(`Output: ${outDir}`);
  console.log(`Viewports: ${viewportLabels}`);
  if (opts.darkMode) console.log("Dark mode: enabled");
  console.log("");

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const allResults = [];
  const variants = opts.darkMode ? ["light", "dark"] : ["light"];

  for (const file of htmlFiles) {
    const basename = path.basename(file);
    for (const variant of variants) {
      const tag = variant === "dark" ? " (dark)" : "";
      process.stdout.write(`  ${basename}${tag} ...`);
      try {
        const screenshots = await captureFile(page, file, outDir, variant, viewports, opts);
        allResults.push(...screenshots);
        console.log(` done (${screenshots.length} screenshots)`);
      } catch (err) {
        console.log(` FAILED: ${err.message}`);
      }
    }
  }

  await browser.close();

  console.log(`\nTotal: ${allResults.length} screenshots captured`);
  for (const f of allResults) {
    console.log(`  ${path.relative(process.cwd(), f)}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
