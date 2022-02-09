module.exports = {
  launch: {
    headless: true, // set to false to view browser window
  },
  server: {
    command: 'node index.js serve test/e2e/test_site -n',
    port: 8080,
  },
};
