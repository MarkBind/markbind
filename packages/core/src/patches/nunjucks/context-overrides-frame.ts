/*
 Patch for nunjucks to allow <include><variable>...</variable></include> to properly
 override the included file's {% set / import %}s.

 By design, nunjucks' variables are scoped, and declarations down the line have
 priority over earlier ones.
 This does not change from a user perspective; The change here affects only variables
 passed programmatically to its methods.

 This patch allows us to reverse this priority for MarkBind variables, facilitating content reuse.

 Patch is written against nunjucks v3.2.2
 The **only** changes are delimited with a // CHANGE HERE comment
 */

/* eslint-disable */

const runtime = require('nunjucks/src/runtime');
const {
  Environment, Template, lib, compiler, nodes,
} = require('nunjucks');
const { Obj } = require('nunjucks/src/object');

const globalRuntime = runtime;

const MB_CTX_KEY = '_markBindReserved';


Environment.prototype.render = function render(name, ctx, cb) {
  if (lib.isFunction(ctx)) {
    cb = ctx;
    ctx = null;
  } // We support a synchronous API to make it easier to migrate
  // existing code to async. This works because if you don't do
  // anything async work, the whole thing is actually run
  // synchronously.

  // CHANGE HERE
  // Store MarkBind variables inside a reserved key
  // This lets us keep as much of nunjucks' method signatures as possible
  if (ctx) {
    ctx = {
      [MB_CTX_KEY]: ctx
    }
  }

  var syncResult = null;
  this.getTemplate(name, function (err, tmpl) {
    if (err && cb) {
      callbackAsap(cb, err);
    } else if (err) {
      throw err;
    } else {
      syncResult = tmpl.render(ctx, cb);
    }
  });
  return syncResult;
};

Environment.prototype.renderString = function renderString(src, ctx, opts, cb) {
  if (lib.isFunction(opts)) {
    cb = opts;
    opts = {};
  }

  // CHANGE HERE
  // Store MarkBind variables inside a reserved key
  // This lets us keep as much of nunjucks' method signatures as possible
  if (ctx) {
    ctx = {
      [MB_CTX_KEY]: ctx
    }
  }

  opts = opts || {};
  var tmpl = new Template(src, this, opts.path);
  return tmpl.render(ctx, cb);
};

// Unfortunately the Context class isn't exposed so we can't patch it directly.
// So we import methods that use it and let them use this custom implementation instead
class Context extends Obj {
  init(ctx, blocks, env) {
    // Has to be tied to an environment so we can tap into its globals.
    this.env = env || new Environment();

    // Make a duplicate of ctx
    this.ctx = lib.extend({}, ctx);

    this.blocks = {};
    this.exported = [];

    lib.keys(blocks).forEach(name => {
      this.addBlock(name, blocks[name]);
    });
  }

  lookup(name) {
    // This is one of the most called functions, so optimize for
    // the typical case where the name isn't in the globals
    if (name in this.env.globals && !(name in this.ctx)) {
      return this.env.globals[name];
    } else {
      return this.ctx[name];
    }
  }

  // CHANGE HERE - new method
  lookupMbVariable(name) {
    return MB_CTX_KEY in this.ctx
      ? this.ctx[MB_CTX_KEY][name]
      : undefined;
  }

  setVariable(name, val) {
    this.ctx[name] = val;
  }

  getVariables() {
    return this.ctx;
  }

  addBlock(name, block) {
    this.blocks[name] = this.blocks[name] || [];
    this.blocks[name].push(block);
    return this;
  }

  getBlock(name) {
    if (!this.blocks[name]) {
      throw new Error('unknown block "' + name + '"');
    }

    return this.blocks[name][0];
  }

  getSuper(env, name, block, frame, runtime, cb) {
    var idx = lib.indexOf(this.blocks[name] || [], block);
    var blk = this.blocks[name][idx + 1];
    var context = this;

    if (idx === -1 || !blk) {
      throw new Error('no super block available for "' + name + '"');
    }

    blk(env, context, frame, runtime, cb);
  }

  addExport(name) {
    this.exported.push(name);
  }

  getExported() {
    var exported = {};
    this.exported.forEach((name) => {
      exported[name] = this.ctx[name];
    });
    return exported;
  }
}

class Frame {
  constructor(parent, isolateWrites) {
    this.variables = {};
    this.parent = parent;
    this.topLevel = false;
    // if this is true, writes (set) should never propagate upwards past
    // this frame to its parent (though reads may).
    this.isolateWrites = isolateWrites;
  }

  // CHANGE HERE
  // Additional parameter isImport
  set(name, val, resolveUp, isImport) {
    // Allow variables with dots by automatically creating the
    // nested structure
    var parts = name.split('.');
    var obj = this.variables;
    var frame = this;

    // CHANGE HERE
    // flag imports, so we can exclude them from Compiler#compileSymbol
    if (isImport) {
      this.imports = this.imports || new Set();
      this.imports.add(parts[0]);
    }

    if (resolveUp) {
      if ((frame = this.resolve(parts[0], true))) {
        frame.set(name, val);
        return;
      }
    }

    for (let i = 0; i < parts.length - 1; i++) {
      const id = parts[i];

      if (!obj[id]) {
        obj[id] = {};
      }
      obj = obj[id];
    }

    obj[parts[parts.length - 1]] = val;
  }

  get(name) {
    var val = this.variables[name];
    if (val !== undefined) {
      return val;
    }
    return null;
  }

  // CHANGE HERE - additional parameter checkIfIsImport, used for compileSymbol
  lookup(name, checkIfIsImport) {
    var p = this.parent;
    var val = this.variables[name];
    if (val !== undefined) {
      // CHANGE HERE
      // Terminate lookup if it is an import, and return undefined
      if (checkIfIsImport && this.imports && this.imports.has(name)) {
        return undefined;
      }

      return val;
    }
    return p && p.lookup(name);
  }

  resolve(name, forWrite) {
    var p = (forWrite && this.isolateWrites) ? undefined : this.parent;
    var val = this.variables[name];
    if (val !== undefined) {
      return this;
    }
    return p && p.resolve(name);
  }

  push(isolateWrites) {
    return new Frame(this, isolateWrites);
  }

  pop() {
    return this.parent;
  }
}
runtime.Frame = Frame;

compiler.Compiler.prototype.compileImport = function compileImport(node, frame) {
  const target = node.target.value;
  const id = this._compileGetTemplate(node, frame, false, false);
  this._addScopeLevel();

  this._emitLine(id + '.getExported(' +
    (node.withContext ? 'context.getVariables(), frame, ' : '') +
    this._makeCallback(id));
  this._addScopeLevel();

  // CHANGE HERE - flag as import - see modified Frame class
  frame.set(target, id, undefined, true);

  if (frame.parent) {
    this._emitLine(`frame.set("${target}", ${id});`);
  } else {
    this._emitLine(`context.setVariable("${target}", ${id});`);
  }
}

compiler.Compiler.prototype.compileFromImport = function compileFromImport(node, frame) {
  const importedId = this._compileGetTemplate(node, frame, false, false);
  this._addScopeLevel();

  this._emitLine(importedId + '.getExported(' +
    (node.withContext ? 'context.getVariables(), frame, ' : '') +
    this._makeCallback(importedId));
  this._addScopeLevel();

  node.names.children.forEach((nameNode) => {
    var name;
    var alias;
    var id = this._tmpid();

    if (nameNode instanceof nodes.Pair) {
      name = nameNode.key.value;
      alias = nameNode.value.value;
    } else {
      name = nameNode.value;
      alias = name;
    }

    this._emitLine(`if(Object.prototype.hasOwnProperty.call(${importedId}, "${name}")) {`);
    this._emitLine(`var ${id} = ${importedId}.${name};`);
    this._emitLine('} else {');
    this._emitLine(`cb(new Error("cannot import '${name}'")); return;`);
    this._emitLine('}');

    // CHANGE HERE - flag as import - see modified Frame class
    frame.set(alias, id, undefined, true);

    if (frame.parent) {
      this._emitLine(`frame.set("${alias}", ${id});`);
    } else {
      this._emitLine(`context.setVariable("${alias}", ${id});`);
    }
  });
}

compiler.Compiler.prototype.compileSymbol = function compileSymbol(node, frame) {
  var name = node.value;
  // CHANGE HERE
  // returns undefined if it is an import
  var v = frame.lookup(name, true);

  if (v) {
    this._emit(v);
  } else {
    this._emit('runtime.contextOrFrameLookup(' + 'context, frame, "' + name + '")');
  }
};

runtime.contextOrFrameLookup = function contextOrFrameLookup(context, frame, name) {
  // CHANGE HERE - always look up MarkBind variables first
  var mbVar = context.lookupMbVariable(name);
  if (mbVar !== undefined) {
    return mbVar;
  }

  var val = frame.lookup(name);
  return val !== undefined ? val : context.lookup(name);
}

/*
 No modifications below here; The implementation is copy pasted only to redirect classes to our implementation
 */

// No modifications, redefined only to redirect the Context class to our custom implementation
Template.prototype.render = function render(ctx, parentFrame, cb) {
  var _this6 = this;

  if (typeof ctx === 'function') {
    cb = ctx;
    ctx = {};
  } else if (typeof parentFrame === 'function') {
    cb = parentFrame;
    parentFrame = null;
  } // If there is a parent frame, we are being called from internal
  // code of another template, and the internal system
  // depends on the sync/async nature of the parent template
  // to be inherited, so force an async callback


  var forceAsync = !parentFrame; // Catch compile errors for async rendering

  try {
    this.compile();
  } catch (e) {
    var err = lib._prettifyError(this.path, this.env.opts.dev, e);

    if (cb) {
      return callbackAsap(cb, err);
    } else {
      throw err;
    }
  }

  var context = new Context(ctx || {}, this.blocks, this.env);
  var frame = parentFrame ? parentFrame.push(true) : new Frame();
  frame.topLevel = true;
  var syncResult = null;
  var didError = false;
  this.rootRenderFunc(this.env, context, frame, globalRuntime, function (err, res) {
    // TODO: this is actually a bug in the compiled template (because waterfall
    // tasks are both not passing errors up the chain of callbacks AND are not
    // causing a return from the top-most render function). But fixing that
    // will require a more substantial change to the compiler.
    if (didError && cb && typeof res !== 'undefined') {
      // prevent multiple calls to cb
      return;
    }

    if (err) {
      err = lib._prettifyError(_this6.path, _this6.env.opts.dev, err);
      didError = true;
    }

    if (cb) {
      if (forceAsync) {
        callbackAsap(cb, err, res);
      } else {
        cb(err, res);
      }
    } else {
      if (err) {
        throw err;
      }

      syncResult = res;
    }
  });
  return syncResult;
};

// No modifications, redefined only to redirect the Context class to our custom implementation
Template.prototype.getExported = function getExported(ctx, parentFrame, cb) {
  // eslint-disable-line consistent-return
  if (typeof ctx === 'function') {
    cb = ctx;
    ctx = {};
  }

  if (typeof parentFrame === 'function') {
    cb = parentFrame;
    parentFrame = null;
  } // Catch compile errors for async rendering


  try {
    this.compile();
  } catch (e) {
    if (cb) {
      return cb(e);
    } else {
      throw e;
    }
  }

  var frame = parentFrame ? parentFrame.push() : new Frame();
  frame.topLevel = true; // Run the rootRenderFunc to populate the context with exported vars

  var context = new Context(ctx || {}, this.blocks, this.env);
  this.rootRenderFunc(this.env, context, frame, globalRuntime, function (err) {
    if (err) {
      cb(err, null);
    } else {
      cb(null, context.getExported());
    }
  });
};

// No modifications, redefined only to redirect the Context class to our custom implementation
compiler.Compiler.prototype._compileMacro = function _compileMacro(node, frame) {
  var args = [];
  var kwargs = null;
  var funcId = 'macro_' + this._tmpid();
  var keepFrame = (frame !== undefined);

  // Type check the definition of the args
  node.args.children.forEach((arg, i) => {
    if (i === node.args.children.length - 1 && arg instanceof nodes.Dict) {
      kwargs = arg;
    } else {
      this.assertType(arg, nodes.Symbol);
      args.push(arg);
    }
  });

  const realNames = [...args.map((n) => `l_${n.value}`), 'kwargs'];

  // Quoted argument names
  const argNames = args.map((n) => `"${n.value}"`);
  const kwargNames = ((kwargs && kwargs.children) || []).map((n) => `"${n.key.value}"`);

  // We pass a function to makeMacro which destructures the
  // arguments so support setting positional args with keywords
  // args and passing keyword args as positional args
  // (essentially default values). See runtime.js.
  let currFrame;
  if (keepFrame) {
    currFrame = frame.push(true);
  } else {
    currFrame = new Frame();
  }
  this._emitLines(
    `var ${funcId} = runtime.makeMacro(`,
    `[${argNames.join(', ')}], `,
    `[${kwargNames.join(', ')}], `,
    `function (${realNames.join(', ')}) {`,
    'var callerFrame = frame;',
    'frame = ' + ((keepFrame) ? 'frame.push(true);' : 'new runtime.Frame();'),
    'kwargs = kwargs || {};',
    'if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {',
    'frame.set("caller", kwargs.caller); }');

  // Expose the arguments to the template. Don't need to use
  // random names because the function
  // will create a new run-time scope for us
  args.forEach((arg) => {
    this._emitLine(`frame.set("${arg.value}", l_${arg.value});`);
    currFrame.set(arg.value, `l_${arg.value}`);
  });

  // Expose the keyword arguments
  if (kwargs) {
    kwargs.children.forEach((pair) => {
      const name = pair.key.value;
      this._emit(`frame.set("${name}", `);
      this._emit(`Object.prototype.hasOwnProperty.call(kwargs, "${name}")`);
      this._emit(` ? kwargs["${name}"] : `);
      this._compileExpression(pair.value, currFrame);
      this._emit(');');
    });
  }

  const bufferId = this._pushBuffer();

  this._withScopedSyntax(() => {
    this.compile(node.body, currFrame);
  });

  this._emitLine('frame = ' + ((keepFrame) ? 'frame.pop();' : 'callerFrame;'));
  this._emitLine(`return new runtime.SafeString(${bufferId});`);
  this._emitLine('});');
  this._popBuffer();

  return funcId;
}

// No modifications, redefined only to redirect the Context class to our custom implementation
compiler.Compiler.prototype.compileRoot = function compileRoot(node, frame) {
  if (frame) {
    this.fail('compileRoot: root node can\'t have frame');
  }

  frame = new Frame();

  this._emitFuncBegin(node, 'root');
  this._emitLine('var parentTemplate = null;');
  this._compileChildren(node, frame);
  this._emitLine('if(parentTemplate) {');
  this._emitLine('parentTemplate.rootRenderFunc(env, context, frame, runtime, cb);');
  this._emitLine('} else {');
  this._emitLine(`cb(null, ${this.buffer});`);
  this._emitLine('}');
  this._emitFuncEnd(true);

  this.inBlock = true;

  const blockNames = [];

  const blocks = node.findAll(nodes.Block);

  blocks.forEach((block, i) => {
    const name = block.name.value;

    if (blockNames.indexOf(name) !== -1) {
      throw new Error(`Block "${name}" defined more than once.`);
    }
    blockNames.push(name);

    this._emitFuncBegin(block, `b_${name}`);

    const tmpFrame = new Frame();
    this._emitLine('var frame = frame.push(true);');
    this.compile(block.body, tmpFrame);
    this._emitFuncEnd();
  });

  this._emitLine('return {');

  blocks.forEach((block, i) => {
    const blockName = `b_${block.name.value}`;
    this._emitLine(`${blockName}: ${blockName},`);
  });

  this._emitLine('root: root\n};');
}
