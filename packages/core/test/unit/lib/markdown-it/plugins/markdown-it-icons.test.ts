import octicons from '@primer/octicons';
import markdownIt from 'markdown-it';
import {
  markdownItIconsPlugin,
  processIconString,
} from '../../../../../src/lib/markdown-it/plugins/markdown-it-icons';

const expectedOcticon = octicons['git-pull-request'].toSVG();

test('markdown-it-icons renders icon syntax correctly', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);

  const source = ':fab-font-awesome: :glyphicon-home: :octicon-git-pull-request: :mit-task-alt:';

  const result = md.renderInline(source);
  const expected = [
    '<span aria-hidden="true" class="fab fa-font-awesome"></span>',
    '<span aria-hidden="true" class="glyphicon glyphicon-home"></span>',
    expectedOcticon,
    '<span aria-hidden="true" class="material-icons-two-tone align-middle">task_alt</span>',
  ].join(' ');

  expect(result).toEqual(expected);
});

test('markdown-it-icons renders icon syntax in multi-line source correctly', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);
  const source = [
    'text with special characters: before icons',
    ':fab-font-awesome:',
    'text with special characters: between icons',
    ':glyphicon-home:',
    'more text with special characters: between icons',
    ':octicon-git-pull-request:',
    'even more text with special characters: between icons',
    ':mit-task-alt:',
    'text with special characters: after icons',
  ].join('\n');

  const result = md.renderInline(source);
  const expected = [
    'text with special characters: before icons',
    '<span aria-hidden="true" class="fab fa-font-awesome"></span>',
    'text with special characters: between icons',
    '<span aria-hidden="true" class="glyphicon glyphicon-home"></span>',
    'more text with special characters: between icons',
    expectedOcticon,
    'even more text with special characters: between icons',
    '<span aria-hidden="true" class="material-icons-two-tone align-middle">task_alt</span>',
    'text with special characters: after icons',
  ].join('\n');

  expect(result).toEqual(expected);
});

test('should render all Font Awesome icon types correctly', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);

  // Font Awesome brands, solid, regular, icons
  expect(md.renderInline(':fab-github:')).toBe('<span aria-hidden="true" class="fab fa-github"></span>');
  expect(md.renderInline(':fas-home:')).toBe('<span aria-hidden="true" class="fas fa-home"></span>');
  expect(md.renderInline(':far-heart:')).toBe('<span aria-hidden="true" class="far fa-heart"></span>');
  expect(md.renderInline(':fa-brands-twitter:'))
    .toBe('<span aria-hidden="true" class="fa-brands fa-twitter"></span>');
  expect(md.renderInline(':fa-solid-star:'))
    .toBe('<span aria-hidden="true" class="fa-solid fa-star"></span>');
});

test('should render all Glyphicon icons correctly', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);
  expect(md.renderInline(':glyphicon-home:'))
    .toBe('<span aria-hidden="true" class="glyphicon glyphicon-home"></span>');
  expect(md.renderInline(':glyphicon-chevron-left:'))
    .toBe('<span aria-hidden="true" class="glyphicon glyphicon-chevron-left"></span>');
});

test('should render all Octicon icons with SVG output', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);

  // Basic octicon - should contain SVG content
  const basicResult = md.renderInline(':octicon-mark-github:');
  expect(basicResult).toContain('<svg');
  expect(basicResult).toContain('</svg>');

  // Octicon with custom class
  const customClassResult = md.renderInline(':octicon-star~custom-class:');
  expect(customClassResult).toContain('custom-class');
  expect(customClassResult).toContain('<svg');

  // Invalid octicon should render empty span
  expect(md.renderInline(':octicon-invalid-icon:')).toBe('<span aria-hidden="true"></span>');
});

test('should render all Octicon light icons with white color', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);

  // Octicon light with white color
  const lightResult = md.renderInline(':octiconlight-star:');
  expect(lightResult).toContain('<svg');
  expect(lightResult).toContain('style="color: #fff"');

  // Octicon light with custom class
  const lightCustomResult = md.renderInline(':octiconlight-mark-github~light-class:');
  expect(lightCustomResult).toContain('light-class');
  expect(lightCustomResult).toContain('style="color: #fff"');

  // Invalid octicon light should render empty span
  expect(md.renderInline(':octiconlight-invalid:')).toBe('<span aria-hidden="true"></span>');
});

test('should render all Material icon variants correctly', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);

  // Material icons filled (default), outlined, round, sharp, two-tone
  expect(md.renderInline(':mif-home:'))
    .toBe('<span aria-hidden="true" class="material-icons align-middle">home</span>');
  expect(md.renderInline(':mio-home:'))
    .toBe('<span aria-hidden="true" class="material-icons-outlined align-middle">home</span>');
  expect(md.renderInline(':mir-home:'))
    .toBe('<span aria-hidden="true" class="material-icons-round align-middle">home</span>');
  expect(md.renderInline(':mis-home:'))
    .toBe('<span aria-hidden="true" class="material-icons-sharp align-middle">home</span>');
  expect(md.renderInline(':mit-home:'))
    .toBe('<span aria-hidden="true" class="material-icons-two-tone align-middle">home</span>');

  // Dash-to-underscore conversion
  expect(md.renderInline(':mif-account-circle:'))
    .toBe('<span aria-hidden="true" class="material-icons align-middle">account_circle</span>');
});

test('should render all Bootstrap icons correctly', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);

  // Basic bootstrap icons, with dashes
  expect(md.renderInline(':bi-house:')).toBe('<i class="bi-house"></i>');
  expect(md.renderInline(':bi-arrow-left:')).toBe('<i class="bi-arrow-left"></i>');
  expect(md.renderInline(':bi-backpack2:')).toBe('<i class="bi-backpack2"></i>');
  expect(md.renderInline(':bi-backpack2-fill:')).toBe('<i class="bi-backpack2-fill"></i>');
});

test('should handle multiple icons and complex scenarios', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);

  // Multiple different icons
  const multipleResult = md.renderInline(':fab-github: :glyphicon-home: :mif-star: :bi-heart:');
  expect(multipleResult).toContain('class="fab fa-github"');
  expect(multipleResult).toContain('class="glyphicon glyphicon-home"');
  expect(multipleResult).toContain('class="material-icons align-middle">star');
  expect(multipleResult).toContain('class="bi-heart"');

  // Icons in text context
  const textResult = md.renderInline('Check out our :fab-github: repository and :glyphicon-star: it!');
  expect(textResult).toContain('Check out our');
  expect(textResult).toContain('class="fab fa-github"');
  expect(textResult).toContain('repository and');
  expect(textResult).toContain('class="glyphicon glyphicon-star"');
  expect(textResult).toContain('it!');
});

test('should handle edge cases and invalid syntax', () => {
  const md = markdownIt();
  md.use(markdownItIconsPlugin);

  // Invalid icon syntax cases
  const testCases = [
    ':invalid-syntax:',
    ':fab:', // missing icon name
    'fab-github', // missing colons
    ':fab-github', // missing closing colon
    'fab-github:', // missing opening colon
    ':fab-:', // empty icon name
  ];

  testCases.forEach((testCase) => {
    const result = md.renderInline(testCase);
    expect(result).not.toContain('<span aria-hidden="true"');
    expect(result).not.toContain('<i class="bi-');
  });

  // Icons in different contexts (headings, lists, paragraphs)
  const blockSource = [
    '# Heading with :fab-github:',
    'Paragraph with :glyphicon-home: icon.',
    '- List item with :mif-star:',
    '- Another item with :bi-heart:',
  ].join('\n');

  const blockResult = md.render(blockSource);
  expect(blockResult)
    .toContain('<h1>Heading with <span aria-hidden="true" class="fab fa-github"></span></h1>');
  expect(blockResult).toContain('class="glyphicon glyphicon-home"');
  expect(blockResult).toContain('class="material-icons align-middle">star');
  expect(blockResult).toContain('class="bi-heart"');
});

test('processIconString function should handle all scenarios', () => {
  expect(processIconString('fab-github')).toBe('<span aria-hidden="true" class="fab fa-github"></span>');
  expect(processIconString(':fab-github:')).toBe('<span aria-hidden="true" class="fab fa-github"></span>');
  expect(processIconString('invalid-icon')).toBeNull();

  const octiconResult = processIconString('octicon-star~custom-class');
  expect(octiconResult).toContain('custom-class');

  expect(processIconString('mif-account-circle'))
    .toBe('<span aria-hidden="true" class="material-icons align-middle">account_circle</span>');
});
