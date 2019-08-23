module.exports = {
  plugins: ['prettier'],
  env: {
    es6: true,
    browser: false
  },
  extends: ['airbnb-base/legacy', 'prettier', 'plugin:node/recommended'],
  rules: {
    'prettier/prettier': 'error',
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'no-return-assign': 'off',
    'func-names': 'off',
    'no-process-exit': 'off',
    'object-shorthand': 'off',
    'class-methods-use-this': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'prettier/prettier': 'off',
    'no-extend-native': 'off',
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    'no-prototype-builtins': 'off',
    'no-plusplus': 'off'
  }
};
