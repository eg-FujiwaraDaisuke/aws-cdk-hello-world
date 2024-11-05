import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";
import importPlugin from "eslint-plugin-import";
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
  },
  {
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      "import": importPlugin,
      "unused-imports": unusedImports,
      "vitest": vitestPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "unused-imports/no-unused-imports": "error",
      "import/order": ["error", { alphabetize: { order: "asc" } }],
      "vitest/prefer-setup-hook": "warn",
      "vitest/no-setup-in-describe": "warn",
    },
  },
  {
    rules: {
        ...typescriptPlugin.configs.recommended.rules,
        "import/order": [
            "error",
            {
                "groups": [["builtin", "external", "internal"]],
                "alphabettize": { "order": "asc", "caseInsensitive": true },
            },
        ],
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
            "warn",
            { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" },
        ],
        "vitest/no-facused-tests": "error",
        "vitest/no-identical-tittle": "error",
        "vitest/valid-expect": "error",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" },
  },
];
