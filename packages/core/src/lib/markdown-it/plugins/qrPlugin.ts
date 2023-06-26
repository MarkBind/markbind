import MarkdownIt from 'markdown-it';

type TokenType = 'qrcode';

export default function qrPlugin(md: MarkdownIt) {
    md.inline.ruler.before('text', 'qrcode', function (state: any, silent: boolean): boolean {
        const max = state.posMax;

        // Looking for [qrcode: in the text
        if (state.src.slice(state.pos, state.pos + 8) !== '[qrcode:') {
            return false;
        }

        // Looking for the end of qrcode:YourDataHere attrName=attrValue]
        let contentStart = state.pos + 8;
        let attrsStart;
        for (; state.pos < max; state.pos++) {
            if (state.src.charCodeAt(state.pos) === 0x20 /* space */) {
                attrsStart = attrsStart ?? state.pos + 1;
            }
            if (state.src.charCodeAt(state.pos) === 0x5D  /* ] */) {
                break;
            }
        }

        if (state.src.charCodeAt(state.pos) !== 0x5D  /* ] */) {
            return false;
        }

        if (!silent) {
            const content = state.src.slice(contentStart, attrsStart ? attrsStart - 1 : state.pos);
            const attrsStr = attrsStart ? state.src.slice(attrsStart, state.pos) : '';

            // Split the attributes string into pairs of name and value
            const attrs: Array<[string, string]> = attrsStr.split(' ').map((attr: string) => attr.split('=') as [string, string]);

            // Add a qrcode token to the state
            const token = state.push('qrcode' as TokenType, 'qrcode', 0);
            token.content = content;

            // Add each attribute to the token
            attrs.forEach(([name, value]) => {
                token.attrSet(name, value);
            });
        }

        state.pos++;
        return true;
    });

    md.renderer.rules['qrcode'] = function (tokens, idx) {
        const token = tokens[idx];
        const attrs = token.attrs ? token.attrs.map(([name, value]) => `${name}="${value}"`).join(' ') : '';
        return `<qrcode ${attrs}>${token.content}</qrcode>`;
    };
}
