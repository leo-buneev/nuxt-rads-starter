import antfu from '@antfu/eslint-config'
import format from 'eslint-plugin-format'

/**
 * Usage:
 * 1. Make sure you have "eslint": "^9.7.0" in your devDependencies
 * 2. put "eslint.config.mjs" to the root of your project with content:
 *
 * import eslintConfigFlat from '@creditas/storybook/eslintConfigFlat.mjs'
 * export default eslintConfigFlat({
 *   name: 'creditas',
 *   rules: {
 *     // your rule overrides here
 *   },
 * })
 *
 * Uses @antfu/eslint-config as base.
 */

export default antfu(
  { stylistic: false, formatters: { prettierOptions: getPrettierDefaults() } },
  ...getPrettierConfig(),
  {
    name: 'rads-ui',
    rules: {
      'perfectionist/sort-imports': ['off'],
      'vue/html-self-closing': ['off'],
      'vue/html-indent': ['off'],
      'vue/singleline-html-element-content-newline': ['off'],
      'import/consistent-type-specifier-style': ['warn', 'prefer-top-level'],
      'unicorn/no-array-for-each': ['error'],
      'object-shorthand': ['warn', 'always', { avoidQuotes: false }],
      'sonarjs/no-duplicate-string': ['off'], // too many positives with tailwind classes
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'node/prefer-global/process': ['off'],
      'no-undef': ['off'],
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'unused-imports/no-unused-vars': [
        'warn',
        {
          args: 'none',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
          groups: ['type', ['builtin', 'external'], 'parent', 'sibling'],
          distinctGroup: false,
          pathGroupsExcludedImportTypes: ['builtin', 'type'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'parent',
              position: 'before',
            },
            {
              pattern: '@@/**',
              group: 'parent',
              position: 'before',
            },
          ],
        },
      ],
    },
  },
)

function getPrettierDefaults() {
  return {
    embeddedLanguageFormatting: 'auto',
    printWidth: 120,
    singleQuote: true,
    semi: false,
    htmlWhitespaceSensitivity: 'ignore',
    endOfLine: 'auto',
  }
}

function getPrettierConfig() {
  const extensions = ['less', 'scss', 'sass', 'css', 'html', 'md', 'js', 'mjs', 'ts', 'jsx', 'tsx', 'vue']
  return [
    { name: 'prettier:setup', plugins: { format } },
    ...extensions.map((ext) => ({
      files: [`**/*.${ext}`],
      name: `prettier:${ext}`,
      languageOptions: ['ts', 'js', 'mjs', 'md', 'jsx', 'tsx', 'vue'].includes(ext)
        ? {}
        : { parser: format.parserPlain },
      rules: {
        'format/prettier': ['warn', { ...getPrettierDefaults() }],
      },
    })),
  ]
}
