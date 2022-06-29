module.exports = {
  launch: {
    headless: true, // set to false to view browser window
    defaultViewport: null, // set this to have viewport emulation off
  },
  server: {
    command: 'cd test/e2e/test_site && '
      + 'node ../../../index.js serve --dev --no-open --port 8888',
    debug: true,
    launchTimeout: 30000,
    port: 8888,
  },
};
