module.exports = {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'cjs' }],
  ],
  plugins: [
    '@babel/plugin-syntax-import-attributes',
    ['babel-plugin-transform-import-meta', { module: 'ES6' }]
  ],
};
