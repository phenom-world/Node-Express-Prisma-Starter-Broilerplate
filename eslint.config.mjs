import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';

import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  eslint.configs.recommended,
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/logs/**', '**/node_modules/*', '**/node_modules/**/*', '**/prisma/schema/types'],
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        process: true,
        __dirname: true,
        global: true,
        Buffer: true,
        console: true,
        Express: true,
        URL: true,
        URLSearchParams: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [1, { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'no-use-before-define': ['warn', { variables: true }],
      'no-duplicate-imports': 2,
      'simple-import-sort/imports': 2,
      'simple-import-sort/exports': 2,
      '@typescript-eslint/indent': 0,
      '@typescript-eslint/no-explicit-any': 2,
      'unused-imports/no-unused-imports': 2,
      '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
      'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['**/*.{js,ts}'],
  },
];
