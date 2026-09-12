import globals from "globals";
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2021,
      sourceType: "commonjs",
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_|next" }],
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["warn", "single"],
      "indent": ["warn", 2],
    },
  },
  {
    ignores: ["node_modules/**", "uploads/**", "*.postman_collection.json"],
  },
];