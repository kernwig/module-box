import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

// obsidianmd's recommended set already includes ESLint's and typescript-eslint's
// type-checked recommended rules, plus the checks Obsidian's plugin review runs.
export default defineConfig([
  {
    ignores: ["node_modules/**", "dist/**", ".test-build/**", "**/*.mjs"],
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
      // Off: it flags deliberate lowercase option labels that mirror module
      // values, and the plugin forbids disabling it per line.
      "obsidianmd/ui/sentence-case": "off",
    },
  },
  {
    // node:test's test() returns a promise the runner tracks itself.
    files: ["src/**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
]);
