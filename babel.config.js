module.exports = {
  presets: [
    '@babel/preset-env',
    [
      '@babel/preset-typescript',
      {
        allExtensions: true,
        isTSX: false,
        onlyRemoveTypeImports: true,
      },
    ],
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  overrides: [
    {
      test: /\.ts$/,
      presets: [
        '@babel/preset-env',
        ['@babel/preset-typescript', { onlyRemoveTypeImports: true }],
      ],
    },
    {
      test: /\.vue$/,
      presets: [
        '@babel/preset-env',
        ['@babel/preset-typescript', { allExtensions: true, onlyRemoveTypeImports: true }],
      ],
    },
  ],
};
