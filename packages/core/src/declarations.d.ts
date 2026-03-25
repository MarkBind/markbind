// Ambient module declarations for packages that lack proper ESM/NodeNext-compatible types.

// markdown-it internal subpaths (markdown-it v12 has no `exports` field)
declare module 'markdown-it/lib/renderer' {
  import MarkdownIt from 'markdown-it';
  export = MarkdownIt.Renderer;
}

declare module 'markdown-it/lib/token' {
  import MarkdownIt from 'markdown-it';
  export = MarkdownIt.Token;
}

declare module 'markdown-it/lib/rules_block/state_block' {
  class StateBlock {
    constructor(...args: any[]);
    src: any; md: any; env: any; tokens: any[];
    bMarks: any[]; eMarks: any[]; tShift: any[]; sCount: any[]; bsCount: any[];
    blkIndent: any; line: any; lineMax: any; tight: any;
    ddIndent: any; listIndent: any; parentType: any; level: any; result: any;
    Token: any;
    push(...args: any[]): any;
    isEmpty(...args: any[]): any;
    skipEmptyLines(...args: any[]): any;
    skipSpaces(...args: any[]): any;
    skipSpacesBack(...args: any[]): any;
    skipChars(...args: any[]): any;
    skipCharsBack(...args: any[]): any;
    getLines(...args: any[]): any;
    [key: string]: any;
  }
  namespace StateBlock {
    type ParentType = any;
  }
  export = StateBlock;
}

declare module 'markdown-it/lib/rules_inline/state_inline' {
  class StateInline {
    constructor(...args: any[]);
    src: any; env: any; md: any; tokens: any[]; tokens_meta: any[];
    pos: any; posMax: any; level: any; pending: any; pendingLevel: any;
    cache: any; delimiters: any[];
    Token: any;
    pushPending(): any;
    push(...args: any[]): any;
    scanDelims(...args: any[]): any;
    [key: string]: any;
  }
  namespace StateInline {
    interface Scanned { can_open: boolean; can_close: boolean; length: number; }
    interface Delimiter {
      marker: any; length: any; jump: any; token: any; end: any; open: any; close: any;
    }
    interface TokenMata { delimiters: Delimiter[]; }
  }
  export = StateInline;
}

declare module 'markdown-it/lib/rules_core/state_core' {
  class StateCore {
    constructor(...args: any[]);
    src: any; env: any; tokens: any[]; inlineMode: any; md: any; Token: any;
    [key: string]: any;
  }
  export = StateCore;
}

declare module 'markdown-it/lib/common/html_blocks' {
  const html_blocks: string[];
  export = html_blocks;
}

// Untyped markdown-it plugins
declare module 'markdown-it-mark';
declare module 'markdown-it-sub';
declare module 'markdown-it-sup';
declare module '@tlylt/markdown-it-imsize';
declare module 'markdown-it-table-of-contents';
declare module 'markdown-it-task-lists';
declare module 'markdown-it-linkify-images';
declare module 'markdown-it-texmath';
declare module 'markdown-it-attrs';
declare module 'markdown-it-emoji';

// Untyped utility packages
declare module 'fastmatter';

// csv-parse v4 subpath (no `exports` field)
declare module 'csv-parse/lib/sync' {
  function parse(input: Buffer | string, options?: object): any[];
  export = parse;
}

// @markbind/core-web UMD bundle
declare module '@markbind/core-web/dist/js/vueCommonAppFactory.min.js' {
  import type { Plugin } from 'vue';

  interface MarkBindVuePlugin {
    plugin: Plugin;
  }

  interface AppFactoryOptions {
    data(): { searchData: unknown[] };
    methods: {
      searchCallback(match: { src: string; heading?: { id: string } }): void;
    };
  }

  export const MarkBindVue: MarkBindVuePlugin;
  export function appFactory(): AppFactoryOptions;
}
