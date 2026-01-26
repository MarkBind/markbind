export default function normalizeUrl(url) {
  if (url.endsWith('.html')) {
    return url.toLowerCase();
  } else if (url.endsWith('/')) {
    return `${url}index.html`.toLowerCase();
  } else if (!url.endsWith('/')) {
    return `${url}.html`.toLowerCase();
  }
  return url.toLowerCase();
}
