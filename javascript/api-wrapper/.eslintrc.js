module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2020: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    semi: [2, 'always'],
    'space-before-function-paren': [2, 'never']
  }
};
