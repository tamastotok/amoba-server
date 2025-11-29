import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    /*rules: {
      'no-console':
        process.env.NODE_ENV === 'production'
          ? ['error', { allow: ['error'] }]
          : ['warn', { allow: ['error'] }],
    },*/
  },
  {
    files: ['**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
  },
]);
