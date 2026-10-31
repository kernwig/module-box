import esbuild from "esbuild";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prod = process.argv[2] === "production";
const manifest = JSON.parse(readFileSync(join(__dirname, "manifest.json"), "utf8"));

// The release files (main.js, manifest.json, styles.css) live in the repo root.
// To try a build in a vault, set OBSIDIAN_VAULT to the vault's folder and the
// three files are also copied into <vault>/.obsidian/plugins/<id>/.
const vault = process.env.OBSIDIAN_VAULT;
const vaultDir = vault ? join(vault, ".obsidian", "plugins", manifest.id) : null;

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
  outfile: join(__dirname, "main.js"),
  plugins: [
    {
      name: "copy-to-vault",
      setup(build) {
        build.onEnd((result) => {
          if (!vaultDir || result.errors.length > 0) return;
          mkdirSync(vaultDir, { recursive: true });
          for (const f of ["main.js", "manifest.json", "styles.css"]) {
            copyFileSync(join(__dirname, f), join(vaultDir, f));
          }
          console.log("Copied to", vaultDir);
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
  console.log("Watching for changes");
}
