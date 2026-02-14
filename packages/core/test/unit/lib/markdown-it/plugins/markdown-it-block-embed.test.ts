import markdownIt from 'markdown-it';

import blockEmbedPlugin from '../../../../../src/lib/markdown-it/plugins/markdown-it-block-embed';

describe('markdown-it-block-embed plugin', () => {
  let md: markdownIt;

  beforeEach(() => {
    md = markdownIt();
    md.use(blockEmbedPlugin);
  });

  describe('YouTube embeds', () => {
    test('should embed YouTube video with standard URL', () => {
      const source = '@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)';
      const result = md.render(source);
      expect(result).toContain('<iframe');
      expect(result).toContain('youtube.com/embed/dQw4w9WgXcQ');
      expect(result).toContain('allowfullscreen');
    });

    test('should handle YouTube URL with timestamp', () => {
      const source = '@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s)';
      const result = md.render(source);

      expect(result).toContain('<iframe');
      expect(result).toContain('youtube.com/embed/dQw4w9WgXcQ');
    });
  });

  describe('Vimeo embeds', () => {
    test('should embed Vimeo video', () => {
      const source = '@[vimeo](https://vimeo.com/123456789)';
      const result = md.render(source);

      expect(result).toContain('<iframe');
      expect(result).toContain('player.vimeo.com/video/123456789');
      expect(result).toContain('allowfullscreen');
    });

    test('should handle Vimeo URL with additional parameters', () => {
      const source = '@[vimeo](https://vimeo.com/123456789?autoplay=1)';
      const result = md.render(source);
      expect(result).toContain('<iframe');
      expect(result).toContain('player.vimeo.com/video/123456789');
    });
  });

  describe('Vine embeds', () => {
    test('should embed Vine video', () => {
      const source = '@[vine](https://vine.co/v/abc123def456)';
      const result = md.render(source);

      expect(result).toContain('<iframe');
      expect(result).toContain('vine.co/v/abc123def456/embed/simple');
    });
  });

  describe('Prezi embeds', () => {
    test('should embed Prezi presentation', () => {
      const source = '@[prezi](https://prezi.com/abc123def456/presentation-title/)';
      const result = md.render(source);

      expect(result).toContain('<iframe');
      expect(result).toContain('prezi.com/embed/abc123def456');
    });
  });

  describe('SlideShare embeds', () => {
    test('should embed SlideShare presentation', () => {
      const source = '@[slideshare](https://www.slideshare.net/username/presentation-title)';
      const result = md.render(source);

      expect(result).toContain('<iframe');
      expect(result).toContain('slideshare.net');
    });
  });

  describe('PowerPoint Online embeds', () => {
    test('should embed PowerPoint Online presentation', () => {
      const source
      = '@[powerpoint](https://onedrive.live.com/embed?cid=abc123&resid=def456&authkey=ghi789&em=2)';
      const result = md.render(source);

      expect(result).toContain('<iframe');
      expect(result).toContain('onedrive.live.com/embed');
    });
  });

  describe('Multiple embeds', () => {
    test('should handle multiple different embeds', () => {
      const source = [
        '',
        '@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
        '',
        '@[vimeo](https://vimeo.com/123456789)',
        '',
        '@[vine](https://vine.co/v/abc123def456)',
        '',
      ].join('\n');
      const result = md.render(source);
      expect(result).toContain('youtube.com/embed/dQw4w9WgXcQ');
      expect(result).toContain('player.vimeo.com/video/123456789');
      expect(result).toContain('vine.co/v/abc123def456/embed/simple');
    });
  });

  describe('Edge cases', () => {
    test('should not process invalid embed syntax', () => {
      const testCases = [
        '@youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)', // missing opening bracket
        '@[youtube(https://www.youtube.com/watch?v=dQw4w9WgXcQ)', // missing closing bracket
        '@[](https://www.youtube.com/watch?v=dQw4w9WgXcQ)', // empty service name
      ];

      testCases.forEach((testCase) => {
        const result = md.render(testCase);
        expect(result).not.toContain('<iframe');
      });
    });

    test('should handle embed in different contexts', () => {
      const source = [
        '# Video Section',
        '',
        'Here\'s a video:',
        '',
        '@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
        '',
        'And some text after.',
      ].join('\n');

      const result = md.render(source);
      expect(result).toContain('<h1>Video Section</h1>');
      expect(result).toContain('<iframe');
      expect(result).toContain('youtube.com/embed/dQw4w9WgXcQ');
      expect(result).toContain('And some text after');
    });

    test('should handle malformed URLs gracefully', () => {
      const testCases = [
        '@[youtube](https://invalid-youtube-url)',
        '@[vimeo](https://invalid-vimeo-url)',
        '@[youtube]()', // empty URL
        '@[youtube]( )', // whitespace URL
      ];

      testCases.forEach((testCase) => {
        const result = md.render(testCase);
        // Should not crash, might render as text or empty
        expect(typeof result).toBe('string');
      });
    });

    test('should preserve iframe attributes', () => {
      const source = '@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)';
      const result = md.render(source);

      expect(result).toContain('frameborder="0"');
      expect(result).toContain('allowfullscreen');
      // Width and height might be set via CSS instead of attributes
      expect(result).toContain('<iframe');
    });

    test('should handle HTTPS and HTTP URLs', () => {
      const httpsSource = '@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)';
      const httpSource = '@[youtube](http://www.youtube.com/watch?v=dQw4w9WgXcQ)';

      const httpsResult = md.render(httpsSource);
      const httpResult = md.render(httpSource);

      expect(httpsResult).toContain('<iframe');
      expect(httpResult).toContain('<iframe');
    });
  });
});
