module.exports = {
  launch: {
    headless: true, // set to false to view browser window
  },
  server: {
    command: 'cd test/e2e/test_site && node ../../../index.js serve -d -n -p 8888',
    debug: true,
    launchTimeout: 30000,
    port: 8888,
  },
};
