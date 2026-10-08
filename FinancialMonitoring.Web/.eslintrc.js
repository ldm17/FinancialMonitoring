module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  ignorePatterns: ['**/*.vue'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'max-len': ['off'],
    // 'no-restricted-syntax': [
    //   'off',
    //   {
    //     selector: 'ForOfStatement',
    //     message: 'for..of loops are not allowed.',
    //   },
    // ],
  },
};
