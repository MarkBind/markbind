/**
 Patch for nunjucks to emit the 'load' event, even if the template is accessed from its internal cache.
 https://mozilla.github.io/nunjucks/api.html#load-event

 This allows page dependencies to be properly collected for live preview in {@link VariableRenderer}.

 Patch is written against nunjucks v3.2.2
 Changes are delimited with a // CHANGE HERE comment
 */

/* linting is disabled for this file to keep the patch close to the source */
/* eslint-disable */

import { Environment, Template, lib } from 'nunjucks';
import { handleError } from 'nunjucks/src/runtime';

/* eslint-disable @typescript-eslint/no-this-alias */

var noopTmplSrc = {
  type: 'code',
  obj: {
    root: function root(env: any, context: any, frame: any, runtime: any, cb: Function) {
      try {
        cb(null, '');
      } catch (e) {
        cb(handleError(e, null, null));
      }
    }
  }
};

(Environment.prototype as any).getTemplate = function getTemplate(
  this: Environment,
  name: any,
  eagerCompile?: any,
  parentName?: any,
  ignoreMissing?: any,
  cb?: any,
) {
  var _this3 = this;

  var that = this;
  var tmpl: Template | null = null;

  if (name && name.raw) {
    // this fixes autoescape for templates referenced in symbols
    name = name.raw;
  }

  if (lib.isFunction(parentName)) {
    cb = parentName;
    parentName = null;
    eagerCompile = eagerCompile || false;
  }

  if (lib.isFunction(eagerCompile)) {
    cb = eagerCompile;
    eagerCompile = false;
  }

  if (name instanceof Template) {
    tmpl = name;
  } else if (typeof name !== 'string') {
    throw new Error('template names must be a string: ' + name);
  } else {
    for (var i = 0; i < this.loaders.length; i++) {
      var loader = this.loaders[i];
      tmpl = loader.cache[this.resolveTemplate(loader, parentName, name)];

      if (tmpl) {
        // CHANGE HERE

        // pathsToNames in nunjucks.loaders.FileSystemLoader maintains a reverse mapping of fullPath: name
        Object.entries(loader.pathsToNames).forEach(([fullPath, templateName]) => {
          if (name === templateName) {
            // Emit the load event
            (this as any).emit('load', name, {
              src: tmpl,
              path: fullPath, // we only need this
              noCache: loader.noCache
            }, loader)
          }
        });

        break;
      }
    }
  }

  if (tmpl) {
    if (eagerCompile) {
      tmpl.compile();
    }

    if (cb) {
      cb(null, tmpl);
      return undefined;
    } else {
      return tmpl;
    }
  }

  var syncResult: Template | undefined;

  var createTemplate = function createTemplate(err: any, info: any) {
    if (!info && !err && !ignoreMissing) {
      err = new Error('template not found: ' + name);
    }

    if (err) {
      if (cb) {
        cb(err);
        return;
      } else {
        throw err;
      }
    }

    var newTmpl;

    if (!info) {
      newTmpl = new Template(noopTmplSrc as any, _this3, '', eagerCompile);
    } else {
      newTmpl = new Template(info.src, _this3, info.path, eagerCompile);

      if (!info.noCache) {
        info.loader.cache[name] = newTmpl;
      }
    }

    if (cb) {
      cb(null, newTmpl);
    } else {
      syncResult = newTmpl;
    }
  };

  lib.asyncIter(this.loaders, function (loader: any, i: number, next: () => void, done: Function) {
    function handle(err: any, src: any) {
      if (err) {
        done(err);
      } else if (src) {
        src.loader = loader;
        done(null, src);
      } else {
        next();
      }
    } // Resolve name relative to parentName


    name = that.resolveTemplate(loader, parentName, name);

    if (loader.async) {
      loader.getSource(name, handle);
    } else {
      handle(null, loader.getSource(name));
    }
  }, createTemplate);
  return syncResult;
}
