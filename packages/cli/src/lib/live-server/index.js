#!/usr/bin/env node

/*
 * Patch for live-server to expose websocket clients for external use in order to keep track
 * of opened tabs.
 *
 * live-server locally keeps track of opened client websockets in order for it to be able
 * to perform live reload whenever there are changes in the watched directory. However, the
 * clients list is stored internally.
 *
 * This patch allows us to gain access to the information that can be gathered with the client
 * websockets, which in turn enables the support for multiple-tab development.
 *
 * Patch is written against live-server v1.2.1
 * The **only** changes are prefaced with a CHANGED comment
 */

var fs = require('fs'),
  connect = require('connect'),
  serveIndex = require('serve-index'),
  logger = require('morgan'),
  WebSocket = require('faye-websocket'),
  path = require('path'),
  parse = require('url-parse'),
  http = require('http'),
  send = require('send'),
  open = require('opn'),
  es = require("event-stream"),
  os = require('os'),
  chokidar = require('chokidar'),
  // CHANGED: added MarkBind's core fsUtil package
  fsUtil = require('@markbind/core/src/utils/fsUtil');
require('colors');

// CHANGED: added absolute path that directs to the live-server directory
const pathToLiveServerDir = path.dirname(require.resolve('live-server'));

// CHANGED: correctly resolve to the live-server directory
var INJECTED_CODE = fs.readFileSync(path.join(pathToLiveServerDir, "injected.html"), "utf8");

var LiveServer = {
  server: null,
  watcher: null,
  logLevel: 2,

  // CHANGED: added properties relevant to MarkBind live-preview
  activeTabs: [],
  baseUrl: '',
};

function escape(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Based on connect.static(), but streamlined and with added code injecter
function staticServer(root) {
  var isFile = false;
  try { // For supporting mounting files instead of just directories
    isFile = fs.statSync(root).isFile();
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  return function(req, res, next) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const reqpath = isFile ? "" : parse(req.url).pathname;
    var hasNoOrigin = !req.headers.origin;
    var injectCandidates = [ new RegExp("</body>", "i"), new RegExp("</svg>"), new RegExp("</head>", "i")];
    var injectTag = null;

    function directory() {
      var pathname = parse(req.url).pathname;
      res.statusCode = 301;
      res.setHeader('Location', pathname + '/');
      res.end('Redirecting to ' + escape(pathname) + '/');
    }

    function file(filepath /*, stat*/) {
      var x = path.extname(filepath).toLocaleLowerCase(), match,
        possibleExtensions = [ "", ".html", ".htm", ".xhtml", ".php", ".svg" ];
      if (hasNoOrigin && (possibleExtensions.indexOf(x) > -1)) {
        // TODO: Sync file read here is not nice, but we need to determine if the html should be injected or not
        var contents = fs.readFileSync(filepath, "utf8");
        for (var i = 0; i < injectCandidates.length; ++i) {
          match = injectCandidates[i].exec(contents);
          if (match) {
            injectTag = match[0];
            break;
          }
        }

        if (injectTag === null && LiveServer.logLevel >= 3) {
          console.warn("Failed to inject refresh script!".yellow,
            "Couldn't find any of the tags ", injectCandidates, "from", filepath);
        }
      }
    }

    function error(err) {
      if (err.status === 404) return next();
      next(err);
    }

    function inject(stream) {
      if (injectTag) {
        // We need to modify the length given to browser
        var len = INJECTED_CODE.length + res.getHeader('Content-Length');
        res.setHeader('Content-Length', len);
        var originalPipe = stream.pipe;
        stream.pipe = function(resp) {
          originalPipe.call(stream, es.replace(new RegExp(injectTag, "i"), INJECTED_CODE + injectTag)).pipe(resp);
        };
      }
    }

    send(req, reqpath, { root: root })
      .on('error', error)
      .on('directory', directory)
      .on('file', file)
      .on('stream', inject)
      .pipe(res);
  };
}

/**
 * Rewrite request URL and pass it back to the static handler.
 * @param staticHandler {function} Next handler
 * @param file {string} Path to the entry point file
 */
function entryPoint(staticHandler, file) {
  if (!file) return function(req, res, next) { next(); };

  return function(req, res, next) {
    req.url = "/" + file;
    staticHandler(req, res, next);
  };
}

/**
 * Start a live server with parameters given as an object
 * @param host {string} Address to bind to (default: 0.0.0.0)
 * @param port {number} Port number (default: 8080)
 * @param root {string} Path to root directory (default: cwd)
 * @param watch {array} Paths to exclusively watch for changes
 * @param ignore {array} Paths to ignore when watching files for changes
 * @param ignorePattern {regexp} Ignore files by RegExp
 * @param noCssInject Don't inject CSS changes, just reload as with any other file change
 * @param open {(string|string[])} Subpath(s) to open in browser, use false to suppress launch (default: server root)
 * @param mount {array} Mount directories onto a route, e.g. [['/components', './node_modules']].
 * @param logLevel {number} 0 = errors only, 1 = some, 2 = lots
 * @param file {string} Path to the entry point file
 * @param wait {number} Server will wait for all changes, before reloading
 * @param htpasswd {string} Path to htpasswd file to enable HTTP Basic authentication
 * @param middleware {array} Append middleware to stack, e.g. [function(req, res, next) { next(); }].
 */
LiveServer.start = function(options) {
  options = options || {};
  var host = options.host || '0.0.0.0';
  var port = options.port !== undefined ? options.port : 8080; // 0 means random
  var root = options.root || process.cwd();
  var mount = options.mount || [];
  var watchPaths = options.watch || [root];
  LiveServer.logLevel = options.logLevel === undefined ? 2 : options.logLevel;
  var openPath = (options.open === undefined || options.open === true) ?
    "" : ((options.open === null || options.open === false) ? null : options.open);
  if (options.noBrowser) openPath = null; // Backwards compatibility with 0.7.0
  var file = options.file;
  var staticServerHandler = staticServer(root);
  var wait = options.wait === undefined ? 100 : options.wait;
  var browser = options.browser || null;
  var htpasswd = options.htpasswd || null;
  var cors = options.cors || false;
  var https = options.https || null;
  var proxy = options.proxy || [];
  var middleware = options.middleware || [];
  var noCssInject = options.noCssInject;
  var httpsModule = options.httpsModule;

  if (httpsModule) {
    try {
      require.resolve(httpsModule);
    } catch (e) {
      console.error(("HTTPS module \"" + httpsModule + "\" you've provided was not found.").red);
      console.error("Did you do", "\"npm install " + httpsModule + "\"?");
      return;
    }
  } else {
    httpsModule = "https";
  }

  // Setup a web server
  var app = connect();

  // Add logger. Level 2 logs only errors
  if (LiveServer.logLevel === 2) {
    app.use(logger('dev', {
      skip: function (req, res) { return res.statusCode < 400; }
    }));
    // Level 2 or above logs all requests
  } else if (LiveServer.logLevel > 2) {
    app.use(logger('dev'));
  }
  if (options.spa) {
    middleware.push("spa");
  }
  // Add middleware
  middleware.map(function(mw) {
    if (typeof mw === "string") {
      var ext = path.extname(mw).toLocaleLowerCase();
      if (ext !== ".js") {
        // CHANGED: correctly resolve to the live-server directory
        mw = require(path.join(pathToLiveServerDir, "middleware", mw + ".js"));
      } else {
        mw = require(mw);
      }
    }
    app.use(mw);
  });

  // Use http-auth if configured
  if (htpasswd !== null) {
    var auth = require('http-auth');
    var basic = auth.basic({
      realm: "Please authorize",
      file: htpasswd
    });
    app.use(auth.connect(basic));
  }
  if (cors) {
    app.use(require("cors")({
      origin: true, // reflecting request origin
      credentials: true // allowing requests with credentials
    }));
  }
  mount.forEach(function(mountRule) {
    var mountPath = path.resolve(process.cwd(), mountRule[1]);
    if (!options.watch) // Auto add mount paths to wathing but only if exclusive path option is not given
      watchPaths.push(mountPath);
    app.use(mountRule[0], staticServer(mountPath));
    if (LiveServer.logLevel >= 1)
      console.log('Mapping %s to "%s"', mountRule[0], mountPath);

    // CHANGED: added baseUrl initialization based on the first mount rule
    if (LiveServer.baseUrl === '') {
      LiveServer.baseUrl = mountRule[0] || '/';
    }
  });
  proxy.forEach(function(proxyRule) {
    var proxyOpts = parse(proxyRule[1]);
    proxyOpts.via = true;
    proxyOpts.preserveHost = true;
    app.use(proxyRule[0], require('proxy-middleware')(proxyOpts));
    if (LiveServer.logLevel >= 1)
      console.log('Mapping %s to "%s"', proxyRule[0], proxyRule[1]);
  });
  app.use(staticServerHandler) // Custom static server
    .use(entryPoint(staticServerHandler, file))
    .use(serveIndex(root, { icons: true }));

  var server, protocol;
  if (https !== null) {
    var httpsConfig = https;
    if (typeof https === "string") {
      httpsConfig = require(path.resolve(process.cwd(), https));
    }
    server = require(httpsModule).createServer(httpsConfig, app);
    protocol = "https";
  } else {
    server = http.createServer(app);
    protocol = "http";
  }

  // Handle server startup errors
  server.addListener('error', function(e) {
    if (e.code === 'EADDRINUSE') {
      var serveURL = protocol + '://' + host + ':' + port;
      console.log('%s is already in use. Trying another port.'.yellow, serveURL);
      setTimeout(function() {
        server.listen(0, host);
      }, 1000);
    } else {
      console.error(e.toString().red);
      LiveServer.shutdown();
    }
  });

  // Handle successful server
  server.addListener('listening', function(/*e*/) {
    LiveServer.server = server;

    var address = server.address();
    var serveHost = address.address === "0.0.0.0" ? "127.0.0.1" : address.address;
    var openHost = host === "0.0.0.0" ? "127.0.0.1" : host;

    var serveURL = protocol + '://' + serveHost + ':' + address.port;
    var openURL = protocol + '://' + openHost + ':' + address.port;

    var serveURLs = [ serveURL ];
    if (LiveServer.logLevel > 2 && address.address === "0.0.0.0") {
      var ifaces = os.networkInterfaces();
      serveURLs = Object.keys(ifaces)
        .map(function(iface) {
          return ifaces[iface];
        })
        // flatten address data, use only IPv4
        .reduce(function(data, addresses) {
          addresses.filter(function(addr) {
            return addr.family === "IPv4";
          }).forEach(function(addr) {
            data.push(addr);
          });
          return data;
        }, [])
        .map(function(addr) {
          return protocol + "://" + addr.address + ":" + address.port;
        });
    }

    // Output
    if (LiveServer.logLevel >= 1) {
      if (serveURL === openURL)
        if (serveURLs.length === 1) {
          console.log(("Serving \"%s\" at %s").green, root, serveURLs[0]);
        } else {
          console.log(("Serving \"%s\" at\n\t%s").green, root, serveURLs.join("\n\t"));
        }
      else
        console.log(("Serving \"%s\" at %s (%s)").green, root, openURL, serveURL);
    }

    // Launch browser
    if (openPath !== null)
      if (typeof openPath === "object") {
        openPath.forEach(function(p) {
          open(openURL + p, {app: browser});
        });
      } else {
        open(openURL + openPath, {app: browser});
      }
  });

  // Setup server to listen at port
  server.listen(port, host);
  
  // WebSocket
  // CHANGED: Removed local clients variable in favour of the clients in active tabs entries
  server.addListener('upgrade', function(request, socket, head) {
    var ws = new WebSocket(request, socket, head);
    ws.onopen = function() { ws.send('connected'); };

    if (wait > 0) {
      (function() {
        var wssend = ws.send;
        var waitTimeout;
        ws.send = function() {
          var args = arguments;
          if (waitTimeout) clearTimeout(waitTimeout);
          waitTimeout = setTimeout(function(){
            wssend.apply(ws, args);
          }, wait);
        };
      })();
    }

    ws.onclose = function() {
      /*
       * CHANGED: Modified to remove the active tab that has the closed socket as
       * its current client on socket close. In other words, only socket close event that
       * does not come from live reload will remove the active tab.
       */
      LiveServer.activeTabs = LiveServer.activeTabs.filter(tab => tab.client !== ws);
    };

    // CHANGED: Enhanced client websocket addition process to record the client as an active tab entry
    const reqUrl = path.dirname(request.url);
    const normalizedUrl = fsUtil.ensurePosix(path.relative(LiveServer.baseUrl, reqUrl));

    // If an entry with empty client is present, reuse existing entry to maintain order from pre-reload 
    const existingTab = LiveServer.activeTabs.find(tab => tab.url === normalizedUrl && !tab.client);
    if (existingTab) {
      existingTab.client = ws;
      return;
    }

    // Insert new entry to the active tabs list
    LiveServer.activeTabs.unshift({ url: normalizedUrl, client: ws });
  });

  var ignored = [
    function(testPath) { // Always ignore dotfiles (important e.g. because editor hidden temp files)
      return testPath !== "." && /(^[.#]|(?:__|~)$)/.test(path.basename(testPath));
    }
  ];
  if (options.ignore) {
    ignored = ignored.concat(options.ignore);
  }
  if (options.ignorePattern) {
    ignored.push(options.ignorePattern);
  }
  // Setup file watcher
  LiveServer.watcher = chokidar.watch(watchPaths, {
    ignored: ignored,
    ignoreInitial: true
  });
  function handleChange(changePath) {
    var cssChange = path.extname(changePath) === ".css" && !noCssInject;
    if (LiveServer.logLevel >= 1) {
      if (cssChange)
        console.log("CSS change detected".magenta, changePath);
      else console.log("Change detected".cyan, changePath);
    }

    // CHANGED: Modified the send message to clients routine

    if (cssChange) {
      LiveServer.sendMessageToActiveTabs('refreshcss');
      return;
    }

    // Only reload active tabs if the changed file is opened in one of them
    const normalizeUrl = (url) => {
      if (!url || url.length === 0) {
        return "index.html";
      }

      if (path.extname(url) === '.html') {
        return url;
      }

      return path.posix.join(url, 'index.html');
    };

    let normalizedPath = fsUtil.ensurePosix(path.relative(root, changePath));
    if (LiveServer.activeTabs.some(tab => tab.client && normalizeUrl(tab.url) === normalizedPath)) {
      LiveServer.sendMessageToActiveTabs('reload');
    }
  }
  LiveServer.watcher
    .on("change", handleChange)
    .on("add", handleChange)
    .on("unlink", handleChange)
    .on("addDir", handleChange)
    .on("unlinkDir", handleChange)
    .on("ready", function () {
      if (LiveServer.logLevel >= 1)
        console.log("Ready for changes".cyan);
    })
    .on("error", function (err) {
      console.log("ERROR:".red, err);
    });

  return server;
};

LiveServer.shutdown = function() {
  var watcher = LiveServer.watcher;
  if (watcher) {
    watcher.close();
  }
  var server = LiveServer.server;
  if (server)
    server.close();
};

// CHANGED: Added method to retrieve current active urls
LiveServer.getActiveUrls = () => LiveServer.activeTabs.filter(tab => tab.client).map(tab => tab.url);

// CHANGED: Added method to send message to active tabs
LiveServer.sendMessageToActiveTabs = (msg) => {
  LiveServer.activeTabs.forEach((tab) => {
    if (tab.client) {
      const client = tab.client;
      if (msg === 'reload') {
        // Clear the client from the entry to be refilled in the socket establishment phase after reload
        tab.client = undefined;
      }
      client.send(msg);
    }
  });
}

// CHANGED: Added convenience method to reload all active tabs
LiveServer.reloadActiveTabs = () => LiveServer.sendMessageToActiveTabs('reload');

module.exports = LiveServer;
