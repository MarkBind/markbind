import { unescapeHtml } from '../../../../../src/lib/markdown-it/utils';

describe('unescapeHtml', () => {
  test('should unescape HTML entities and handle mixed content', () => {
    const input = 'Hello &amp; welcome to &lt;MarkBind&gt;! &amp;&lt;&gt;&quot;&#x27;';
    const expected = 'Hello & welcome to <MarkBind>! &<>"\'';
    const result = unescapeHtml(input);
    
    expect(result).toBe(expected);
  });
});
