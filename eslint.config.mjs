import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import vitestPlugin from "eslint-plugin-vitest";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      "import": importPlugin,
      "unused-imports": unusedImports,
      "vitest": vitestPlugin,
      "prettier": prettier,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      "import/order": [
        "error",
        {
          "groups": [["builtin", "external", "internal"]],
          "alphabetize": { "order": "asc", "caseInsensitive": true },
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" },
      ],
      "vitest/no-focused-tests": "error",
      "vitest/no-identical-title": "error",
      "vitest/valid-expect": "error",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
];
