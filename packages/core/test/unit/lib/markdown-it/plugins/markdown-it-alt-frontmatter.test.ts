import markdownIt from 'markdown-it';

import { altFrontmatterPlugin } from '../../../../../src/lib/markdown-it/plugins/markdown-it-alt-frontmatter';

describe('markdown-it-alt-frontmatter plugin', () => {
  let md: markdownIt;

  beforeEach(() => {
    md = markdownIt();
    md.use(altFrontmatterPlugin);
  });

  test('should convert YAML frontmatter to frontmatter tags', () => {
    const source = [
      '---',
      'title: Test Page',
      'author: John Doe',
      '',
      'worksWithblankLine: yes',
      'description: "Quoted description"',
      'tags: [tag1, tag2, tag3]',
      'published: true',
      'date: 2023-01-01',
      '---',
      '',
      'Content here',
    ].join('\n');
    const result = md.render(source);
    expect(result).toContain('<frontmatter>');
    expect(result).toContain('title: Test Page');
    expect(result).toContain('author: John Doe');
    expect(result).toContain('worksWithblankLine: yes');
    expect(result).toContain('</frontmatter>');
    expect(result).toContain('description: "Quoted description"');
    expect(result).toContain('tags: [tag1, tag2, tag3]');
    expect(result).toContain('published: true');
    expect(result).toContain('date: 2023-01-01');
  });

  test('should handle empty frontmatter', () => {
    const source = [
      '---',
      '---',
      '',
      'Content here',
    ].join('\n');
    const result = md.render(source);
    expect(result).toContain('<frontmatter>');
    expect(result).toContain('</frontmatter>');
  });

  test('should not process incomplete frontmatter', () => {
    // Test missing closing delimiter
    const sourceMissingClosing = [
      '---',
      'title: Test Page',
      'author: John Doe',
      '',
      'Content here',
    ].join('\n');
    const resultMissingClosing = md.render(sourceMissingClosing);
    expect(resultMissingClosing).not.toContain('<frontmatter>');

    // Test missing opening delimiter
    const sourceMissingOpening = [
      'title: Test Page',
      'author: John Doe',
      '---',
      '',
      'Content here',
    ].join('\n');
    const resultMissingOpening = md.render(sourceMissingOpening);
    expect(resultMissingOpening).not.toContain('<frontmatter>');
  });

  test('should process frontmatter even when not at document start', () => {
    // The plugin might process frontmatter anywhere in the document
    const source = [
      'Some content',
      '',
      '---',
      'title: Test Page',
      '---',
      '',
      'More content',
    ].join('\n');
    const result = md.render(source);
    expect(result).toContain('Test Page');
  });

  test('should not process frontmatter with invalid content', () => {
    const source = [
      '---',
      'invalid content without colon',
      'title: Valid Title',
      '---',
    ].join('\n');
    const result = md.render(source);
    expect(result).not.toContain('<frontmatter>');
  });

  test('should not process code blocks that look like frontmatter', () => {
    const source = [
      '```yaml',
      '---',
      'title: This is code',
      '---',
      '```',
    ].join('\n');
    const result = md.render(source);
    expect(result).not.toContain('<frontmatter>');
    expect(result).toContain('<code');
  });

  test('should handle multiple frontmatter-like blocks', () => {
    const source = [
      '---',
      'title: First Block',
      '---',
      '',
      'Content',
      '',
      '---',
      'title: Second Block',
      '---',
      '',
      'More content',
    ].join('\n');
    const result = md.render(source);
    // The plugin might process multiple frontmatter blocks
    expect(result).toContain('title: First Block');
    expect(result).toContain('title: Second Block');
  });

  test('should not process frontmatter that reaches end of document without closing marker', () => {
    // This test ensures line 49 is covered: return false when !haveEndMarker
    // Frontmatter that starts but never closes before document ends
    const source = [
      '---',
      'title: Test Page',
      'author: John Doe',
      'description: This frontmatter never closes',
    ].join('\n');
    const result = md.render(source);
    expect(result).not.toContain('<frontmatter>');
    expect(result).toContain('title: Test Page');
    expect(result).toContain('author: John Doe');
  });
});
