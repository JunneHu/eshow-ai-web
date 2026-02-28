

module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  env: {
    node: true,
    es6: true,
    browser: true,
    jest: true,
  },
  // plugins: ['jsx-a11y'],
  globals: {},
  rules: {
    'max-params': 'off',
    'no-console': 'warn',
    'no-debugger': 'warn',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    'react/no-unsafe': 'off',
    '@typescript-eslint/member-ordering': 'off',
    'max-nested-callbacks': 'off',
    complexity: 'off',
    'react/jsx-key': 'off',
    'no-irregular-whitespace': 'off',
    '@typescript-eslint/no-invalid-this': 'off',
    'react/no-deprecated': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    'react/static-property-placement': 'off',
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@typescript-eslint/explicit-member-accessibility': ['error'],
      },
    },
  ],
};
