import { escapeHTML, unescapeHTML } from '../utils/utils';

describe('utils.js - HTML escaping functions', () => {
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

    it('should handle non-string values by converting to string', () => {
      expect(escapeHTML(123)).toBe('123');
      expect(escapeHTML(null)).toBe('null');
      expect(escapeHTML(undefined)).toBe('undefined');
    });

    it('should escape JSON strings correctly', () => {
      const json = '{"name":"test","color":"#28a745"}';
      const escaped = escapeHTML(json);
      expect(escaped).toBe('{&quot;name&quot;:&quot;test&quot;,&quot;color&quot;:&quot;#28a745&quot;}');
    });
  });

  describe('unescapeHTML', () => {
    it('should unescape double quotes', () => {
      expect(unescapeHTML('&quot;hello&quot;')).toBe('"hello"');
    });

    it('should unescape less than and greater than signs', () => {
      expect(unescapeHTML('&lt;div&gt;')).toBe('<div>');
    });

    it('should unescape ampersands', () => {
      expect(unescapeHTML('tom &amp; jerry')).toBe('tom & jerry');
    });

    it('should unescape multiple special characters', () => {
      expect(unescapeHTML('&lt;div class=&quot;test&quot;&gt;')).toBe('<div class="test">');
    });

    it('should handle empty string', () => {
      expect(unescapeHTML('')).toBe('');
    });

    it('should handle string without escaped characters', () => {
      expect(unescapeHTML('hello world')).toBe('hello world');
    });

    it('should handle non-string values by converting to string', () => {
      expect(unescapeHTML(123)).toBe('123');
      expect(unescapeHTML(null)).toBe('null');
      expect(unescapeHTML(undefined)).toBe('undefined');
    });

    it('should unescape JSON strings correctly', () => {
      const escaped = '{&quot;name&quot;:&quot;test&quot;,&quot;color&quot;:&quot;#28a745&quot;}';
      const unescaped = unescapeHTML(escaped);
      expect(unescaped).toBe('{"name":"test","color":"#28a745"}');
    });

    it('should handle order of unescaping correctly', () => {
      // Test that unescaping happens in the right order
      // (avoiding double-unescaping issues)
      expect(unescapeHTML('&amp;quot;')).toBe('&quot;');
      expect(unescapeHTML('&amp;lt;')).toBe('&lt;');
      expect(unescapeHTML('&amp;gt;')).toBe('&gt;');
      expect(unescapeHTML('&amp;amp;')).toBe('&amp;');
    });
  });

  describe('escapeHTML and unescapeHTML round-trip', () => {
    it('should preserve original string after escape and unescape', () => {
      const original = '<div class="test">Hello & goodbye "world"</div>';
      const escaped = escapeHTML(original);
      const unescaped = unescapeHTML(escaped);
      expect(unescaped).toBe(original);
    });

    it('should preserve JSON after escape and unescape', () => {
      const json = '{"name":"Test<>","value":"A & B"}';
      const escaped = escapeHTML(json);
      const unescaped = unescapeHTML(escaped);
      expect(unescaped).toBe(json);
    });

    it('should preserve HTML entities after escape and unescape', () => {
      const original = '&nbsp; &copy; &reg;';
      const escaped = escapeHTML(original);
      const unescaped = unescapeHTML(escaped);
      expect(unescaped).toBe(original);
    });
  });
});
