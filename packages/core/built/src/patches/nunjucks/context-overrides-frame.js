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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
/* eslint-disable */
var runtime = require('nunjucks/src/runtime');
var _a = require('nunjucks'), Environment = _a.Environment, Template = _a.Template, lib = _a.lib, compiler = _a.compiler, nodes = _a.nodes;
var Obj = require('nunjucks/src/object').Obj;
var globalRuntime = runtime;
var MB_CTX_KEY = '_markBindReserved';
Environment.prototype.render = function render(name, ctx, cb) {
    var _a;
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
        ctx = (_a = {},
            _a[MB_CTX_KEY] = ctx,
            _a);
    }
    var syncResult = null;
    this.getTemplate(name, function (err, tmpl) {
        if (err && cb) {
            callbackAsap(cb, err);
        }
        else if (err) {
            throw err;
        }
        else {
            syncResult = tmpl.render(ctx, cb);
        }
    });
    return syncResult;
};
Environment.prototype.renderString = function renderString(src, ctx, opts, cb) {
    var _a;
    if (lib.isFunction(opts)) {
        cb = opts;
        opts = {};
    }
    // CHANGE HERE
    // Store MarkBind variables inside a reserved key
    // This lets us keep as much of nunjucks' method signatures as possible
    if (ctx) {
        ctx = (_a = {},
            _a[MB_CTX_KEY] = ctx,
            _a);
    }
    opts = opts || {};
    var tmpl = new Template(src, this, opts.path);
    return tmpl.render(ctx, cb);
};
// Unfortunately the Context class isn't exposed so we can't patch it directly.
// So we import methods that use it and let them use this custom implementation instead
var Context = /** @class */ (function (_super) {
    __extends(Context, _super);
    function Context() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Context.prototype.init = function (ctx, blocks, env) {
        var _this = this;
        // Has to be tied to an environment so we can tap into its globals.
        this.env = env || new Environment();
        // Make a duplicate of ctx
        this.ctx = lib.extend({}, ctx);
        this.blocks = {};
        this.exported = [];
        lib.keys(blocks).forEach(function (name) {
            _this.addBlock(name, blocks[name]);
        });
    };
    Context.prototype.lookup = function (name) {
        // This is one of the most called functions, so optimize for
        // the typical case where the name isn't in the globals
        if (name in this.env.globals && !(name in this.ctx)) {
            return this.env.globals[name];
        }
        else {
            return this.ctx[name];
        }
    };
    // CHANGE HERE - new method
    Context.prototype.lookupMbVariable = function (name) {
        return MB_CTX_KEY in this.ctx
            ? this.ctx[MB_CTX_KEY][name]
            : undefined;
    };
    Context.prototype.setVariable = function (name, val) {
        this.ctx[name] = val;
    };
    Context.prototype.getVariables = function () {
        return this.ctx;
    };
    Context.prototype.addBlock = function (name, block) {
        this.blocks[name] = this.blocks[name] || [];
        this.blocks[name].push(block);
        return this;
    };
    Context.prototype.getBlock = function (name) {
        if (!this.blocks[name]) {
            throw new Error('unknown block "' + name + '"');
        }
        return this.blocks[name][0];
    };
    Context.prototype.getSuper = function (env, name, block, frame, runtime, cb) {
        var idx = lib.indexOf(this.blocks[name] || [], block);
        var blk = this.blocks[name][idx + 1];
        var context = this;
        if (idx === -1 || !blk) {
            throw new Error('no super block available for "' + name + '"');
        }
        blk(env, context, frame, runtime, cb);
    };
    Context.prototype.addExport = function (name) {
        this.exported.push(name);
    };
    Context.prototype.getExported = function () {
        var _this = this;
        var exported = {};
        this.exported.forEach(function (name) {
            exported[name] = _this.ctx[name];
        });
        return exported;
    };
    return Context;
}(Obj));
var Frame = /** @class */ (function () {
    function Frame(parent, isolateWrites) {
        this.variables = {};
        this.parent = parent;
        this.topLevel = false;
        // if this is true, writes (set) should never propagate upwards past
        // this frame to its parent (though reads may).
        this.isolateWrites = isolateWrites;
    }
    // CHANGE HERE
    // Additional parameter isImport
    Frame.prototype.set = function (name, val, resolveUp, isImport) {
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
        for (var i = 0; i < parts.length - 1; i++) {
            var id = parts[i];
            if (!obj[id]) {
                obj[id] = {};
            }
            obj = obj[id];
        }
        obj[parts[parts.length - 1]] = val;
    };
    Frame.prototype.get = function (name) {
        var val = this.variables[name];
        if (val !== undefined) {
            return val;
        }
        return null;
    };
    // CHANGE HERE - additional parameter checkIfIsImport, used for compileSymbol
    Frame.prototype.lookup = function (name, checkIfIsImport) {
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
    };
    Frame.prototype.resolve = function (name, forWrite) {
        var p = (forWrite && this.isolateWrites) ? undefined : this.parent;
        var val = this.variables[name];
        if (val !== undefined) {
            return this;
        }
        return p && p.resolve(name);
    };
    Frame.prototype.push = function (isolateWrites) {
        return new Frame(this, isolateWrites);
    };
    Frame.prototype.pop = function () {
        return this.parent;
    };
    return Frame;
}());
runtime.Frame = Frame;
compiler.Compiler.prototype.compileImport = function compileImport(node, frame) {
    var target = node.target.value;
    var id = this._compileGetTemplate(node, frame, false, false);
    this._addScopeLevel();
    this._emitLine(id + '.getExported(' +
        (node.withContext ? 'context.getVariables(), frame, ' : '') +
        this._makeCallback(id));
    this._addScopeLevel();
    // CHANGE HERE - flag as import - see modified Frame class
    frame.set(target, id, undefined, true);
    if (frame.parent) {
        this._emitLine("frame.set(\"" + target + "\", " + id + ");");
    }
    else {
        this._emitLine("context.setVariable(\"" + target + "\", " + id + ");");
    }
};
compiler.Compiler.prototype.compileFromImport = function compileFromImport(node, frame) {
    var _this = this;
    var importedId = this._compileGetTemplate(node, frame, false, false);
    this._addScopeLevel();
    this._emitLine(importedId + '.getExported(' +
        (node.withContext ? 'context.getVariables(), frame, ' : '') +
        this._makeCallback(importedId));
    this._addScopeLevel();
    node.names.children.forEach(function (nameNode) {
        var name;
        var alias;
        var id = _this._tmpid();
        if (nameNode instanceof nodes.Pair) {
            name = nameNode.key.value;
            alias = nameNode.value.value;
        }
        else {
            name = nameNode.value;
            alias = name;
        }
        _this._emitLine("if(Object.prototype.hasOwnProperty.call(" + importedId + ", \"" + name + "\")) {");
        _this._emitLine("var " + id + " = " + importedId + "." + name + ";");
        _this._emitLine('} else {');
        _this._emitLine("cb(new Error(\"cannot import '" + name + "'\")); return;");
        _this._emitLine('}');
        // CHANGE HERE - flag as import - see modified Frame class
        frame.set(alias, id, undefined, true);
        if (frame.parent) {
            _this._emitLine("frame.set(\"" + alias + "\", " + id + ");");
        }
        else {
            _this._emitLine("context.setVariable(\"" + alias + "\", " + id + ");");
        }
    });
};
compiler.Compiler.prototype.compileSymbol = function compileSymbol(node, frame) {
    var name = node.value;
    // CHANGE HERE
    // returns undefined if it is an import
    var v = frame.lookup(name, true);
    if (v) {
        this._emit(v);
    }
    else {
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
};
/*
 No modifications below here; The implementation is copy pasted only to redirect classes to our implementation
 */
// No modifications, redefined only to redirect the Context class to our custom implementation
Template.prototype.render = function render(ctx, parentFrame, cb) {
    var _this6 = this;
    if (typeof ctx === 'function') {
        cb = ctx;
        ctx = {};
    }
    else if (typeof parentFrame === 'function') {
        cb = parentFrame;
        parentFrame = null;
    } // If there is a parent frame, we are being called from internal
    // code of another template, and the internal system
    // depends on the sync/async nature of the parent template
    // to be inherited, so force an async callback
    var forceAsync = !parentFrame; // Catch compile errors for async rendering
    try {
        this.compile();
    }
    catch (e) {
        var err = lib._prettifyError(this.path, this.env.opts.dev, e);
        if (cb) {
            return callbackAsap(cb, err);
        }
        else {
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
            }
            else {
                cb(err, res);
            }
        }
        else {
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
    }
    catch (e) {
        if (cb) {
            return cb(e);
        }
        else {
            throw e;
        }
    }
    var frame = parentFrame ? parentFrame.push() : new Frame();
    frame.topLevel = true; // Run the rootRenderFunc to populate the context with exported vars
    var context = new Context(ctx || {}, this.blocks, this.env);
    this.rootRenderFunc(this.env, context, frame, globalRuntime, function (err) {
        if (err) {
            cb(err, null);
        }
        else {
            cb(null, context.getExported());
        }
    });
};
// No modifications, redefined only to redirect the Context class to our custom implementation
compiler.Compiler.prototype._compileMacro = function _compileMacro(node, frame) {
    var _this = this;
    var args = [];
    var kwargs = null;
    var funcId = 'macro_' + this._tmpid();
    var keepFrame = (frame !== undefined);
    // Type check the definition of the args
    node.args.children.forEach(function (arg, i) {
        if (i === node.args.children.length - 1 && arg instanceof nodes.Dict) {
            kwargs = arg;
        }
        else {
            _this.assertType(arg, nodes.Symbol);
            args.push(arg);
        }
    });
    var realNames = __spreadArrays(args.map(function (n) { return "l_" + n.value; }), ['kwargs']);
    // Quoted argument names
    var argNames = args.map(function (n) { return "\"" + n.value + "\""; });
    var kwargNames = ((kwargs && kwargs.children) || []).map(function (n) { return "\"" + n.key.value + "\""; });
    // We pass a function to makeMacro which destructures the
    // arguments so support setting positional args with keywords
    // args and passing keyword args as positional args
    // (essentially default values). See runtime.js.
    var currFrame;
    if (keepFrame) {
        currFrame = frame.push(true);
    }
    else {
        currFrame = new Frame();
    }
    this._emitLines("var " + funcId + " = runtime.makeMacro(", "[" + argNames.join(', ') + "], ", "[" + kwargNames.join(', ') + "], ", "function (" + realNames.join(', ') + ") {", 'var callerFrame = frame;', 'frame = ' + ((keepFrame) ? 'frame.push(true);' : 'new runtime.Frame();'), 'kwargs = kwargs || {};', 'if (Object.prototype.hasOwnProperty.call(kwargs, "caller")) {', 'frame.set("caller", kwargs.caller); }');
    // Expose the arguments to the template. Don't need to use
    // random names because the function
    // will create a new run-time scope for us
    args.forEach(function (arg) {
        _this._emitLine("frame.set(\"" + arg.value + "\", l_" + arg.value + ");");
        currFrame.set(arg.value, "l_" + arg.value);
    });
    // Expose the keyword arguments
    if (kwargs) {
        kwargs.children.forEach(function (pair) {
            var name = pair.key.value;
            _this._emit("frame.set(\"" + name + "\", ");
            _this._emit("Object.prototype.hasOwnProperty.call(kwargs, \"" + name + "\")");
            _this._emit(" ? kwargs[\"" + name + "\"] : ");
            _this._compileExpression(pair.value, currFrame);
            _this._emit(');');
        });
    }
    var bufferId = this._pushBuffer();
    this._withScopedSyntax(function () {
        _this.compile(node.body, currFrame);
    });
    this._emitLine('frame = ' + ((keepFrame) ? 'frame.pop();' : 'callerFrame;'));
    this._emitLine("return new runtime.SafeString(" + bufferId + ");");
    this._emitLine('});');
    this._popBuffer();
    return funcId;
};
// No modifications, redefined only to redirect the Context class to our custom implementation
compiler.Compiler.prototype.compileRoot = function compileRoot(node, frame) {
    var _this = this;
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
    this._emitLine("cb(null, " + this.buffer + ");");
    this._emitLine('}');
    this._emitFuncEnd(true);
    this.inBlock = true;
    var blockNames = [];
    var blocks = node.findAll(nodes.Block);
    blocks.forEach(function (block, i) {
        var name = block.name.value;
        if (blockNames.indexOf(name) !== -1) {
            throw new Error("Block \"" + name + "\" defined more than once.");
        }
        blockNames.push(name);
        _this._emitFuncBegin(block, "b_" + name);
        var tmpFrame = new Frame();
        _this._emitLine('var frame = frame.push(true);');
        _this.compile(block.body, tmpFrame);
        _this._emitFuncEnd();
    });
    this._emitLine('return {');
    blocks.forEach(function (block, i) {
        var blockName = "b_" + block.name.value;
        _this._emitLine(blockName + ": " + blockName + ",");
    });
    this._emitLine('root: root\n};');
};
