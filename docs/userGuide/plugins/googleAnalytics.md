### Plugin: GoogleAnalytics

This plugin allows your web pages to be captured by [google analytics](https://analytics.google.com/analytics/web/#/).

To enable it, add `googleAnalytics` to your site's plugins, and add the `trackingID` parameter via the `pluginsContext`.

Name | Type | Default | Description
---- | ---- | ------- | ------
trackingID | `String` || Tracking ID provided by Google. Follow this [guide](https://support.google.com/analytics/answer/1008080) to get your Tracking ID.

```js {heading="site.json"}
{
  ...
  "plugins": [
    "googleAnalytics"
  ],
  "pluginsContext": {
    "googleAnalytics": {
      "trackingID": "YOUR-TRACKING-ID", // replace with your google analytics tracking id.
    }
  }
}
```
