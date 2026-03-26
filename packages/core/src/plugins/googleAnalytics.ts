import { PluginContext } from './Plugin.js';

function getGoogleAnalyticsTrackingCode(pluginContext: PluginContext) {
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

const getScripts = (pluginContext: PluginContext) => [getGoogleAnalyticsTrackingCode(pluginContext)];

export {
  getScripts,
};
