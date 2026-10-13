// Resuelve Playwright desde el proyecto donde corres el script (no desde el plugin).
// Instala una vez: `npm i -D playwright && npx playwright install chromium`
// (o `@playwright/test`, que también sirve).
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(path.join(process.cwd(), "noop.js"));

export function loadChromium() {
  for (const id of ["playwright", "@playwright/test"]) {
    try {
      return require(id).chromium;
    } catch {}
  }
  console.error(
    "No encuentro Playwright en " + process.cwd() +
      ". Corre: npm i -D playwright && npx playwright install chromium",
  );
  process.exit(1);
}

export function args(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[key] = true;
      else out[key] = argv[++i];
    } else out._.push(a);
  }
  return out;
}

export const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
