## Dark Mode Toggle

<div id="content">

The `dark-mode-toggle` component provides a button that lets readers switch between light and dark themes.

****Usage****

Add `<dark-mode-toggle></dark-mode-toggle>` to your layout or navbar file. The component is only rendered when dark mode is enabled for the site (via the `enableDarkMode` site property).

****How It Works****

- Defaults to the user's OS-level `prefers-color-scheme` setting
- Persists the user's choice in `localStorage` under the key `markbind-theme`

****Placing in the Navbar****

The toggle is automatically included inside the navbar when dark mode is enabled. You can also place it manually anywhere on the page:

```html
<dark-mode-toggle/>
```

</div>
