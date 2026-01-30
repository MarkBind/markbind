import { escapeHTML } from '../../../src/utils/escape';

describe('escapeHTML', () => {
  it('should escape double quotes', () => {
    expect(escapeHTML('"hello"')).toBe('&quot;hello&quot;');
  });

  it('should escape less than and greater than signs', () => {
    expect(escapeHTML('<div>')).toBe('&lt;div&gt;');
  });

  it('should escape ampersands that are not part of entities', () => {
    expect(escapeHTML('tom & jerry')).toBe('tom &amp; jerry');
  });

  it('should not escape ampersands that are part of entities', () => {
    expect(escapeHTML('&nbsp; &lt; &gt;')).toBe('&nbsp; &lt; &gt;');
  });

  it('should escape multiple special characters', () => {
    expect(escapeHTML('<div class="test">')).toBe('&lt;div class=&quot;test&quot;&gt;');
  });

  it('should handle empty string', () => {
    expect(escapeHTML('')).toBe('');
  });

  it('should handle string without special characters', () => {
    expect(escapeHTML('hello world')).toBe('hello world');
  });

  it('should escape JSON strings correctly', () => {
    const json = '{"name":"test","color":"#28a745"}';
    const escaped = escapeHTML(json);
    expect(escaped).toBe('{&quot;name&quot;:&quot;test&quot;,&quot;color&quot;:&quot;#28a745&quot;}');
  });

  it('should handle mixed entities and special characters', () => {
    expect(escapeHTML('&nbsp;<div>&amp;</div>')).toBe('&nbsp;&lt;div&gt;&amp;&lt;/div&gt;');
  });
});
