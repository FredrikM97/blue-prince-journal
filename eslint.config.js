import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'][value.type='Literal'][value.value='flex items-center gap-2']",
          message: "Use `Inline` primitive instead of ad-hoc `flex items-center gap-2`.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'][value.type='Literal'][value.value='flex flex-wrap justify-center gap-3']",
          message: "Use `Inline` primitive with `wrap` and `justify` props.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'][value.type='Literal'][value.value='w-full max-w-6xl space-y-8 text-center']",
          message:
            "Use `CenteredContent` primitive instead of ad-hoc container utility class chains.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'][value.type='Literal'][value.value='border-t border-border/70 pt-6']",
          message: "Use `SectionBlock` primitive for top-divider sections.",
        },
        {
          selector: "Program > :not(ImportDeclaration) ~ ImportDeclaration",
          message: "Keep all imports at the top of the file.",
        },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true, allowExportNames: ["getRouter"] },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/components/**/*.tsx"],
    ignores: ["src/components/common/Button.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            "Use shared Button primitives from `@/components/common/Button` instead of raw <button>.",
        },
      ],
    },
  },
  {
    files: ["src/components/common/ImageCard.tsx"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["src/components/**/*.tsx"],
    ignores: [
      "src/components/common/Button.tsx",
      "src/components/common/Typography.tsx",
      "src/components/common/LayoutPrimitives.tsx",
      "src/components/common/Dialog.tsx",
      "src/components/common/Tabs.tsx",
      "src/components/common/ImageCard.tsx",
      "src/components/common/dropdown/**/*.tsx",
      "src/components/common/input/**/*.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXOpeningElement[name.type='JSXIdentifier'][name.name=/^[a-z]/] > JSXAttribute[name.name='className']",
          message:
            "Avoid className on native elements in feature components. Use shared custom primitives and typed variants instead.",
        },
      ],
    },
  },
  eslintPluginPrettier,
);
