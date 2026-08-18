import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // Tracks components referenced only inside JSX, so `{ icon: Icon }` and
      // friends are no longer reported as unused variables.
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // This project does not use PropTypes; typing is out of scope for now.
      'react/prop-types': 'off',
      // Deliberate no-op catches are annotated with a comment.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Apostrophes in JSX copy render correctly; escaping them hurts
      // readability far more than it helps.
      'react/no-unescaped-entities': 'off',

      // ── Tracked, not yet blocking ──────────────────────────
      // Fetch-on-mount is still the documented React data pattern. Screens are
      // being moved onto hooks/useApiData, which satisfies this rule; the
      // remainder stay visible as warnings until that migration finishes.
      'react-hooks/set-state-in-effect': 'warn',

      // Accessibility clean-up is scheduled work. Warnings keep every finding
      // on screen without blocking the build in the meantime.
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/media-has-caption': 'warn',
    },
  },
  {
    // Barrels, context modules and route factories intentionally export
    // things that are not components.
    files: [
      '{consumer,staff,admin,auth}/routes.jsx',
      '{consumer,staff,admin,auth}/context/**',
      '{consumer,staff,admin,auth}/services/**',
      'admin/components/ui.jsx',
      'shared/ui/**',
      'shared/services/**',
      'shared/context/**',
      'shared/api.jsx',
      'app/guards.jsx',
    ],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
