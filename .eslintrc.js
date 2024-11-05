module.exports = {
  parser: "@typescript-eslint/parser", // TypeScriptを解析するためのパーサー
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // Prettierと統合
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  plugins: [
    "@typescript-eslint",
    "prettier",
    "import",
    "unused-imports",
    // 'vitest' は以下のようにrulesで設定することができる
  ],
  rules: {
    "prettier/prettier": "error", // PrettierのエラーをESLintエラーとして表示
    "unused-imports/no-unused-imports": "error", // 未使用のインポートをエラーとして表示
    "import/order": ["error", { alphabetize: { order: "asc" } }], // インポートの順序をアルファベット順に
    // Vitest用のルールを個別に追加
    "vitest/prefer-setup-hook": "warn",
    "vitest/no-setup-in-describe": "warn",
    // 他のルールを追加することも可能
  },
  settings: {
    "import/resolver": {
      typescript: {}, // TypeScriptのモジュールを解決
    },
  },
};
