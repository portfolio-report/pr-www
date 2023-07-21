const process = require('node:process')

process.env.ESLINT_TSCONFIG = 'tsconfig.json'

module.exports = {
  extends: ['@antfu'],
  rules: {
    'curly': ['warn', 'all'],

    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/brace-style': ['warn', '1tbs', { allowSingleLine: true }],

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

    'unicorn/catch-error-name': [
      'error',
      {
        name: 'err',
      },
    ],
  },
}
