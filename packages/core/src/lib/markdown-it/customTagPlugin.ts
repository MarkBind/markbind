import MarkdownIt from 'markdown-it';
import StateInline from 'markdown-it/lib/rules_inline/state_inline';
import Token from 'markdown-it/lib/token';

interface PluginOptions {
  name: string;
  startDelimiter: string;
  endDelimiter: string;
  component: (attrs: Record<string, string>) => string;
}

function customTagPlugin(md: MarkdownIt, options: PluginOptions) {
  md.inline.ruler.before('text', options.name, (state: StateInline, silent: boolean) => {
    const start = state.src.indexOf(`${options.startDelimiter}${options.name}:`, state.pos);
    if (start !== state.pos) return false;

    const contentStart = start + options.startDelimiter.length + options.name.length + 1;
    const contentEnd = state.src.indexOf(options.endDelimiter, contentStart);

    if (contentEnd === -1) {
      state.pos = state.posMax;
      return false;
    }
    if (!silent) {
      const token = state.push(options.name, '', 0);
      const rawContent = state.src.slice(contentStart, contentEnd);

      const contentArr: string[] = rawContent.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
      const contentObj = contentArr.reduce((acc: { [key: string]: string }, current: string) => {
        const keyValue = current.match(/(.*?)=(.*)/);
        if (keyValue) {
          const [, key, value] = keyValue;
          const match = value.match(/"([^"]*)"|'([^']*)'/);
          if (match) {
            acc[key] = match[1] || match[2];
          }
        }
        return acc;
      }, {});

      token.attrs = Object.entries(contentObj);
      token.info = rawContent;
    }

    state.pos = contentEnd + options.endDelimiter.length;
    return true;
  });

  md.renderer.rules[options.name] = (tokens: Token[], idx: number): string => {
    const attrs = tokens[idx].attrs ?? [];
    const attrObj = attrs.reduce((acc: Record<string, string>, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
    return options.component(attrObj);
  };
}

export { customTagPlugin };
