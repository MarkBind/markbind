const cheerio = module.parent.require('cheerio');

// const IDENTIFIER = '/s';
// const IDENTIFIER2 = 'http://127.0.0.1:8080/index.html';

function loadDisqus(pluginContext) {
  const config = `
    let path = window.location.pathname;
    console.log("path: " + path);
    console.log(window.location.hash);
    console.log("baseUrl: " + baseUrl);
    if (path.startsWith(baseUrl)) {
      path = path.substring(baseUrl.length); // strip baseUrl
    }
    if (path.endsWith('/')) {
      path += 'index.html'; // implicit path
    }
    console.log("path (no baseUrl): " + path);

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

/*
  var disqus_config = function () {
      this.page.url = '${IDENTIFIER2}';  
      this.page.identifier = '${IDENTIFIER2}'; 
  };
  (function() {  // DON'T EDIT BELOW THIS LINE
      var d = document, s = d.createElement('script');
      
      s.src = 'https://https-markbind-org.disqus.com/embed.js';
      
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
  })();
*/

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
