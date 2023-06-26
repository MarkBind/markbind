"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function customTagPlugin(md, options) {
    md.inline.ruler.before('text', options.name, function (state, silent) {
        const start = state.src.indexOf(options.startDelimiter + options.name + ':', state.pos);
        if (start !== state.pos)
            return false;
        const contentStart = start + options.startDelimiter.length + options.name.length + 1;
        const contentEnd = state.src.indexOf(options.endDelimiter, contentStart);
        if (contentEnd === -1) {
            // if closing delimiter is not found, do not process the tag and move the state position to the end of the line
            state.pos = state.posMax;
            return false;
        }
        if (!silent) {
            const token = state.push(options.name, '', 0);
            const rawContent = state.src.slice(contentStart, contentEnd);
            const contentArr = rawContent.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
            const contentObj = contentArr.reduce((acc, current) => {
                const keyValue = current.match(/(.*?)=(.*)/);
                if (keyValue) {
                    const [_, key, value] = keyValue;
                    const match = value.match(/"([^"]*)"|'([^']*)'/);
                    if (match) {
                        // match[1] is for double quotes, match[2] is for single quotes
                        acc[key] = match[1] ? match[1] : match[2];
                    }
                }
                return acc;
            }, {});
            token.attrs = Object.entries(contentObj);
            token.info = rawContent; // For render rule
        }
        state.pos = contentEnd + options.endDelimiter.length;
        return true;
    });
    // The new render function uses the component option to generate HTML
    md.renderer.rules[options.name] = function (tokens, idx) {
        var _a;
        const attrs = (_a = tokens[idx].attrs) !== null && _a !== void 0 ? _a : [];
        const attrObj = attrs.reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
        return options.component(attrObj); // Generate HTML using the component option
    };
}
exports.default = customTagPlugin;
//# sourceMappingURL=customTagPlugin.js.map