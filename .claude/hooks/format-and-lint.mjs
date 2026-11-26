// PostToolUse hook (Write|Edit): formatea con Prettier y corrige con ESLint
// cualquier archivo del proyecto que Claude cree o edite.
// Si quedan errores de lint sin auto-fix, sale con código 2 para que Claude los vea y los corrija.
import { spawnSync } from "node:child_process";
import path from "node:path";

const LINTABLE = /\.(c|m)?(j|t)sx?$/i;
const IGNORED =
  /(^|[\\/])(node_modules|\.next|out|build|references|\.git)([\\/]|$)/;

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

let filePath;
try {
  const input = JSON.parse(raw);
  filePath = input.tool_input?.file_path ?? input.tool_response?.filePath;
} catch {
  process.exit(0);
}
if (!filePath) process.exit(0);

const projectDir = path.resolve(
  process.env.CLAUDE_PROJECT_DIR ?? process.cwd(),
);
const abs = path.resolve(filePath);
const rel = path.relative(projectDir, abs);

// Solo archivos dentro de arcade-vault y fuera de carpetas generadas/ignoradas.
if (!rel || rel.startsWith("..") || path.isAbsolute(rel) || IGNORED.test(rel))
  process.exit(0);

const BINS = {
  prettier: path.join(
    projectDir,
    "node_modules",
    "prettier",
    "bin",
    "prettier.cjs",
  ),
  eslint: path.join(projectDir, "node_modules", "eslint", "bin", "eslint.js"),
};
const run = (bin, args) =>
  spawnSync(process.execPath, [BINS[bin], ...args], {
    cwd: projectDir,
    encoding: "utf8",
  });

run("prettier", ["--write", "--ignore-unknown", "--log-level", "warn", abs]);

if (LINTABLE.test(abs)) {
  const lint = run("eslint", ["--fix", "--no-warn-ignored", abs]);
  if (lint.status === 1) {
    process.stderr.write(
      `ESLint encontró problemas en ${rel}:\n${lint.stdout}${lint.stderr}`,
    );
    process.exit(2);
  }
}
process.exit(0);
