function getGoogleAnalyticsTrackingCode(pluginContext) {
    return "\n    <!-- Global site tag (gtag.js) - Google Analytics -->\n    <script async src=\"https://www.googletagmanager.com/gtag/js?id=" + pluginContext.trackingID + "\"></script>\n    <script>\n      window.dataLayer = window.dataLayer || [];\n      function gtag(){dataLayer.push(arguments);}\n      gtag('js', new Date());\n    \n      gtag('config', '" + pluginContext.trackingID + "');\n    </script>";
}
module.exports = {
    // eslint-disable-next-line no-unused-vars
    getScripts: function (pluginContext) { return [getGoogleAnalyticsTrackingCode(pluginContext)]; },
};
