import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      import: importPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // ✅ General
      'no-console': 'warn',
      'no-duplicate-imports': 'error',
      eqeqeq: 'error',

      // ✅ TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // ✅ React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // ✅ Hooks (IMPORTANT)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ✅ Simplicity / maintainability
      complexity: ['warn', 10],
      'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true }],
      'no-nested-ternary': 'warn',

      // ✅ Imports / structure
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
    },
  },

  // ✅ TS stricter logic (non-UI files)
  {
    files: ['**/*.ts'],
    rules: {
      complexity: ['warn', 8],
    },
  },

  // ✅ UI constraints (TSX)
  {
    files: ['**/*.tsx'],
    rules: {
      'max-lines-per-function': ['warn', { max: 60 }],
    },
  },
];