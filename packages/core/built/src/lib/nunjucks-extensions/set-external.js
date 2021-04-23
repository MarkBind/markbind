var fs = require('fs-extra');
var path = require('path');
var Parser = require('nunjucks/src/parser').Parser;
var lex = require('nunjucks/src/lexer').lex;
var _ = {};
_.isArray = require('lodash/isArray');
_.isObject = require('lodash/isObject');
_.isString = require('lodash/isString');
var logger = require('../../utils/logger');
/**
 * Nunjucks extension for sourcing in variables from external sources.
 * Supports only .json sources for now.
 */
var SetExternalExtension = /** @class */ (function () {
    function SetExternalExtension(rootPath, env) {
        this.tags = ['ext'];
        this.rootPath = rootPath;
        this.env = env;
    }
    SetExternalExtension.prototype.emitLoad = function (fullPath) {
        // Emit the nunjucks load event for the listener in {@link VariableRenderer}
        this.env.emit('load', '', { path: fullPath });
    };
    SetExternalExtension.prototype.parse = function (parser, nodes, lexer) {
        var _this = this;
        // get the tag token
        var setExtTagToken = parser.nextToken();
        // parse the args and move after the block end. passing true
        // as the second arg is required if there are no parentheses
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(setExtTagToken.value);
        var firstChild = args.children[0];
        var buffer = [];
        if (firstChild instanceof nodes.KeywordArgs) {
            firstChild.children.forEach(function (pair) {
                var variableName = pair.key.value;
                var resourcePath = pair.value.value;
                if (resourcePath.endsWith('.json')) {
                    var fullResourcePath = path.resolve(_this.rootPath, resourcePath);
                    var resourceRaw = fs.readFileSync(fullResourcePath);
                    buffer.push("{% set " + variableName + " = " + resourceRaw + " %}");
                    _this.emitLoad(fullResourcePath);
                }
            });
        }
        else {
            logger.error("Invalid {% ext %} tag at line " + setExtTagToken.lineno + ".");
            return new nodes.NodeList(setExtTagToken.lineno, setExtTagToken.colno, []);
        }
        var newParser = new Parser(lex(buffer.join('\n'), lexer.opts));
        if (parser.extensions !== undefined) {
            newParser.extensions = parser.extensions;
        }
        return newParser.parse();
    };
    return SetExternalExtension;
}());
module.exports = {
    SetExternalExtension: SetExternalExtension,
};
