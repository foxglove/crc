// @ts-check

const foxglove = require("@foxglove/eslint-plugin");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: ["**/dist/"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: "tsconfig.eslint.json",
      },
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: 'BinaryExpression[operator=">>"]',
          message:
            "When working with unsigned numbers, use the unsigned right shift operator `>>>`.",
        },
      ],
    },
  },
  ...foxglove.configs.base,
  ...foxglove.configs.jest,
  ...foxglove.configs.typescript.map((config) => ({
    ...config,
    files: ["**/*.@(ts|tsx)"],
  })),
);
