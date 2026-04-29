import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import stylistic from '@stylistic/eslint-plugin';

export default defineConfig([
  globalIgnores(['dist/*']),
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
  stylistic.configs.customize({
    // the following options are the default values
    indent: 2,
    quotes: 'single',
    semi: true,
    jsx: true,
    arrowParens: true,
  }),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          caughtErrors: 'all',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          ignoreUsingDeclarations: false,
          reportUsedIgnorePattern: false,
        },
      ],
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
        },
      ],
    },
  },
]);
