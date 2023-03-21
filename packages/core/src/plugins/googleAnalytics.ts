function getGoogleAnalyticsTrackingCode(pluginContext) {
  return `
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${pluginContext.trackingID}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', '${pluginContext.trackingID}');
    </script>`;
}

module.exports = {
  // eslint-disable-next-line no-unused-vars
  getScripts: pluginContext => [getGoogleAnalyticsTrackingCode(pluginContext)],
};
