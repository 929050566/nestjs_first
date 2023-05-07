module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'jest', 'prettier', 'import', 'unused-imports'],
  extends: [
      // airbnb规范
      'airbnb-base',
      // 兼容typescript的airbnb规范
      'airbnb-typescript/base',
      // typescript的eslint插件
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking',

      // 支持jest
      'plugin:jest/recommended',
      // 使用prettier格式化代码
      'prettier',
      // 整合typescript-eslint与prettier
      'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
