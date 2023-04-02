import cheerio from 'cheerio';
import { MbNode } from '../utils/node';
import { PluginContext } from './Plugin';

function loadDisqus(pluginContext: PluginContext) {
  const config = `
    let path = window.location.pathname;

    // strip baseUrl
    if (path.startsWith(baseUrl)) {
      path = path.substring(baseUrl.length); 
    }

    const pathParams = path.split('/');
    const lastPathParam = pathParams[pathParams.length - 1];
    const hasNoFileExtension = !lastPathParam.includes('.');

    // implicit path to index.html
    if (path.endsWith('/')) {
      path += 'index.html'; // e.g. .../path/
    } else if (hasNoFileExtension) {
      path += '/index.html'; // e.g. .../path
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

export = {
  processNode: (pluginContext: PluginContext, node: MbNode) => {
    if (node.name !== 'disqus') {
      return;
    }

    node.attribs['v-pre'] = '';

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
