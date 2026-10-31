import esbuild from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, watchFile } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prod = process.argv[2] === "production";
const manifest = JSON.parse(readFileSync(join(__dirname, "manifest.json"), "utf8"));

// dist/ holds the three release files: main.js (built), manifest.json (copied
// from the root, where Obsidian reads it), and styles.css (copied from src/).
// To try a build in a vault, set OBSIDIAN_VAULT to the vault's folder and dist/
// is also copied into <vault>/.obsidian/plugins/<id>/.
const distDir = join(__dirname, "dist");
const staticFiles = [
  join(__dirname, "manifest.json"),
  join(__dirname, "src", "styles.css"),
];
const releaseFiles = ["main.js", "manifest.json", "styles.css"];
const vault = process.env.OBSIDIAN_VAULT;
const vaultDir = vault ? join(vault, ".obsidian", "plugins", manifest.id) : null;

function copyStatic() {
  mkdirSync(distDir, { recursive: true });
  for (const src of staticFiles) {
    copyFileSync(src, join(distDir, basename(src)));
  }
}

function copyToVault() {
  if (!vaultDir) return;
  mkdirSync(vaultDir, { recursive: true });
  for (const f of releaseFiles) {
    copyFileSync(join(distDir, f), join(vaultDir, f));
  }
  console.log("Copied to", vaultDir);
}

const context = await esbuild.context({
  entryPoints: [join(__dirname, "src", "main.ts")],
  bundle: true,
  format: "cjs",
  target: "es2021",
  platform: "browser",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  minify: prod,
  // Obsidian provides these at runtime; never bundle them.
  external: ["obsidian", "electron", "@codemirror/*", "@lezer/*", "node:*"],
  outfile: join(distDir, "main.js"),
  plugins: [
    {
      name: "copy-release-files",
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length > 0) return;
          copyStatic();
          copyToVault();
        });
      },
    },
  ],
});

if (prod) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
  // esbuild only watches what main.ts imports, so watch the copied files too.
  // Polling survives editors that save by replacing the file.
  for (const src of staticFiles) {
    watchFile(src, { interval: 500 }, () => {
      copyStatic();
      copyToVault();
    });
  }
  console.log("Watching for changes");
}
