module.exports = {
  launch: {
    headless: true, // set to false to view browser window
  },
  server: {
    command: 'node index.js serve test/e2e/test_site -n -p 8888',
    debug: true,
    launchTimeout: 5000,
    port: 8888,
  },
};
