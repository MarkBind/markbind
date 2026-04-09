# Deploy to Netlify

## Manual Setup

1. Go to `https://app.netlify.com/` and create a site from your Git repository.
2. Configure build settings:
   - **Build command:** `npm i markbind-cli -g && markbind build --baseUrl`
   - **Publish directory:** `_site`
   - **Environment variable:** `NODE_VERSION` = `22` or higher

After setup, Netlify auto-deploys updates from your configured branch.

## Pinning a Specific MarkBind Version

1. Initialize npm metadata (if needed): `npm init`
2. Add MarkBind dependency version: `npm install markbind-cli@5.0.0 --save`
3. Ensure `node_modules` is ignored in `.gitignore`
4. Add `"node_modules/*"` to `site.json` `ignore`
5. Use Netlify build command: `markbind build --baseUrl`

## User Guide Source

- <https://markbind.org/userGuide/deployingTheSite.html>
