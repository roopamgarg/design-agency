#!/usr/bin/env node

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

const PAGE_TIMEOUT_MS = 10_000;

function usage() {
  console.log(`
Usage: node capture-screenshots.js [options] <path>

Capture PNG screenshots of HTML design files at mobile (390px) and desktop (1440px) viewports.

Arguments:
  <path>    Path to an HTML file or a directory of HTML files

Options:
  --dark       Also capture dark-mode variants (prefers-color-scheme: dark)
  --help       Show this help message

Examples:
  node scripts/capture-screenshots.js output/dating-app/screens/discover.html
  node scripts/capture-screenshots.js output/dating-app/screens/
  node scripts/capture-screenshots.js --dark output/storycraft/screens/
`);
}

function collectHtmlFiles(targetPath) {
  const resolved = path.resolve(targetPath);
  const stat = fs.statSync(resolved);

  if (stat.isFile()) {
    if (!resolved.endsWith(".html")) {
      console.error(`Error: ${resolved} is not an HTML file`);
      process.exit(1);
    }
    return [resolved];
  }

  if (stat.isDirectory()) {
    return fs
      .readdirSync(resolved)
      .filter((f) => f.endsWith(".html"))
      .sort()
      .map((f) => path.join(resolved, f));
  }

  console.error(`Error: ${resolved} is not a file or directory`);
  process.exit(1);
}

async function captureFile(page, htmlPath, outDir, variant) {
  const fileUrl = `file://${htmlPath}`;
  const baseName = path.basename(htmlPath, ".html");

  if (variant === "dark") {
    await page.emulateMedia({ colorScheme: "dark" });
  } else {
    await page.emulateMedia({ colorScheme: "light" });
  }

  const results = [];

  for (const [label, size] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(size);

    await page.goto(fileUrl, { waitUntil: "load", timeout: PAGE_TIMEOUT_MS });

    // Wait for fonts and external images to settle
    try {
      await page.waitForLoadState("networkidle", { timeout: PAGE_TIMEOUT_MS });
    } catch {
      // Timeout is acceptable — best-effort resource loading
    }

    // Extra pause for late-rendering CSS / font swap
    await page.waitForTimeout(500);

    const suffix = variant === "dark" ? `-${label}-dark` : `-${label}`;
    const outFile = path.join(outDir, `${baseName}${suffix}.png`);

    await page.screenshot({ path: outFile, fullPage: true });
    results.push(outFile);
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    usage();
    process.exit(0);
  }

  const darkMode = args.includes("--dark");
  const targetPath = args.filter((a) => !a.startsWith("--"))[0];

  if (!targetPath) {
    console.error("Error: no path provided");
    usage();
    process.exit(1);
  }

  if (!fs.existsSync(targetPath)) {
    console.error(`Error: path not found: ${targetPath}`);
    process.exit(1);
  }

  const htmlFiles = collectHtmlFiles(targetPath);

  if (htmlFiles.length === 0) {
    console.error("No HTML files found at the given path");
    process.exit(1);
  }

  const outDir = path.join(path.dirname(htmlFiles[0]), "screenshots");
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\nCapturing ${htmlFiles.length} HTML file(s)`);
  console.log(`Output directory: ${outDir}`);
  console.log(`Viewports: mobile (${VIEWPORTS.mobile.width}px), desktop (${VIEWPORTS.desktop.width}px)`);
  if (darkMode) console.log("Dark mode: enabled");
  console.log("");

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const allResults = [];
  const variants = darkMode ? ["light", "dark"] : ["light"];

  for (const file of htmlFiles) {
    const basename = path.basename(file);
    for (const variant of variants) {
      const tag = variant === "dark" ? " (dark)" : "";
      process.stdout.write(`  ${basename}${tag} ...`);
      try {
        const screenshots = await captureFile(page, file, outDir, variant);
        allResults.push(...screenshots);
        console.log(` done (${screenshots.length} screenshots)`);
      } catch (err) {
        console.log(` FAILED: ${err.message}`);
      }
    }
  }

  await browser.close();

  console.log(`\nSummary: ${allResults.length} screenshots captured`);
  for (const f of allResults) {
    console.log(`  ${path.relative(process.cwd(), f)}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
