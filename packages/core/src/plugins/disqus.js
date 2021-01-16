const cheerio = module.parent.require('cheerio');

function loadDisqus(pluginContext) {
  const config = `
    const path = window.location.pathname;
    const hostname = window.location.hostname;
    const strippedPath = path.replace(window.baseUrl, '');

    const getDisqusConfig = () => {
      return function() {
        this.page.url = hostname; // Replace with your page's canonical URL variable
        this.page.identifier = strippedPath; // Replace with your page's unique identifier variable 
      }
    }

    const disqus_config = getDisqusConfig();   
  `;

  const load = `
    (function() {
      const script = window.document.createElement('script');
      script.src = 'https://${pluginContext.shortname}.disqus.com/embed.js';
      document.body.appendChild(script);
    })();    
  `;

  const lazyLoad = `
    const options = { 
      root: null,
      threshold: 1,
      rootMargin: '300px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ${load}
          observer.unobserve(entry.target);
        }
      });
    }, options);

    const elem = document.querySelector('#disqus_thread');
    observer.observe(elem);
  `;

  return `
    <script>
      ${config}
      ${lazyLoad}
    </script>
  `;
}

module.exports = {
  getScripts: pluginContext => [loadDisqus(pluginContext)],
  processNode: (pluginContext, node) => {
    if (node.name !== 'disqus') {
      return;
    }
    cheerio(node).append('<div id="disqus_thread"></div>');
  },
};
