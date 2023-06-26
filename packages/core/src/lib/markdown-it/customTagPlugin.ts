import MarkdownIt from 'markdown-it';
import StateInline from 'markdown-it/lib/rules_inline/state_inline';
import Token from 'markdown-it/lib/token';

interface PluginOptions {
    name: string;
    startDelimiter: string;
    endDelimiter: string;
    component: (attrs: Record<string, string>) => string;
}

export default function customTagPlugin(md: MarkdownIt, options: PluginOptions) {
    md.inline.ruler.before('text', options.name, function (state: StateInline, silent: boolean) {
        const start = state.src.indexOf(options.startDelimiter + options.name + ':', state.pos);
        if (start !== state.pos) return false;

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

            const contentArr = rawContent.split(' ');
            const contentObj = contentArr.reduce((acc: { [key: string]: string }, current) => {
                if (current.includes('=')) {
                    const [key, value] = current.split('=');
                    acc[key] = value.replace(/"/g, '');  // removes quotes from value
                }
                return acc;
            }, {});

            token.attrs = Object.entries(contentObj);
            token.info = rawContent;  // For render rule
        }

        state.pos = contentEnd + options.endDelimiter.length;
        return true;
    });

    // The new render function uses the component option to generate HTML
    md.renderer.rules[options.name] = function (tokens: Token[], idx: number): string {
        const attrs = tokens[idx].attrs ?? [];
        const attrObj = attrs.reduce((acc: Record<string, string>, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
        return options.component(attrObj);  // Generate HTML using the component option
    };
}
