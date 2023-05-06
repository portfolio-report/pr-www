process.env.ESLINT_TSCONFIG = 'tsconfig.json'

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: ['@antfu'],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'no-console': 'warn',

    'antfu/if-newline': 'off',
    'antfu/top-level-function': 'off',
    'vue/component-tags-order': 'off',
    'vue/prefer-template': 'off',
    'prefer-template': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'vue/eqeqeq': 'off',
    'vue/prefer-separate-static-class': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'curly': 'off',
    'arrow-parens': 'off',
    'operator-linebreak': 'off',
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-indent': 'off',
    'vue/html-closing-bracket-newline': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',

    // sort imports
    'sort-imports': ['warn', { ignoreDeclarationSort: true }],

    // Allow <template v-slot:foo.bar> or <template #foo.bar>
    'vue/valid-v-slot': [
      'error',
      {
        allowModifiers: true,
      },
    ],

    // Enable additional vue rules
    // https://eslint.vuejs.org/rules/
    'vue/block-lang': [
      'error',
      {
        script: {
          lang: 'ts',
        },
      },
    ],
    'vue/component-name-in-template-casing': [
      'warn',
      'PascalCase',
      { registeredComponentsOnly: false },
    ],
    'vue/define-macros-order': 'warn',
    'vue/require-emit-validator': 'warn',

    'unicorn/prevent-abbreviations': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/prefer-switch': 'off',
    'unicorn/no-null': 'off',
    'unicorn/catch-error-name': [
      'error',
      {
        name: 'err',
      },
    ],
    'unicorn/prefer-ternary': ['error', 'only-single-line'],
    'unicorn/better-regex': 'off',
    'unicorn/prefer-top-level-await': 'off',
  },
}
