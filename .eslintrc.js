// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@nuxtjs/eslint-config-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended',
  ],
  plugins: ['prettier'],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'no-console': 'warn',

    // sort imports
    'sort-imports': ['warn', { ignoreDeclarationSort: true }],

    // Allow <template v-slot:foo.bar> or <template #foo.bar>
    'vue/valid-v-slot': [
      'error',
      {
        allowModifiers: true,
      },
    ],

    // eslint-plugin-nuxt is still for nuxt/vue 2
    'vue/no-v-model-argument': 'off',

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
