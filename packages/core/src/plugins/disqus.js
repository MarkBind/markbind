const cheerio = module.parent.require('cheerio');

function loadDisqus(pluginContext) {
  const config = `
    let path = window.location.pathname;
    if (path.startsWith(baseUrl)) {
      path = path.substring(baseUrl.length); // strip baseUrl
    }
    if (path.endsWith('/')) {
      path += 'index.html'; // implicit path
    }

    // need to use var and ES5 function syntax to work
    var disqus_config = function() {
      this.page.identifier = path;
    };   
  `;

  const load = `
    const script = window.document.createElement('script');
    script.src = 'https://${pluginContext.shortname}.disqus.com/embed.js';
    document.body.appendChild(script);
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
    if (elem) {
      observer.observe(elem);
    }
  `;

  return `
    ${config}
    ${lazyLoad}
  `;
}

module.exports = {
  processNode: (pluginContext, node) => {
    if (node.name !== 'disqus') {
      return;
    }

    const $ = cheerio(node);
    $.append('<div id="disqus_thread"></div>');
    const script = `
      <script>
        const script = window.document.createElement('script');
        script.innerHTML = \`${loadDisqus(pluginContext)}\`;
        document.addEventListener("DOMContentLoaded", () => {
          document.body.appendChild(script);
        });
      </script>
    `;
    $.append(script);
  },
};
