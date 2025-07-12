import md from '../../../../src/lib/markdown-it/index';
import begEndPlugin from '../../../../src/plugins/default/markbind-plugin-begendMathDelimitor';

describe('begEndPlugin', () => {
  beforeEach(() => {
    // Reset the plugin state if needed
    jest.resetModules();
  });

  it('should render \\begin{equation} math using beg_end delimiter', () => {
    // apply the plugin
    begEndPlugin.beforeSiteGenerate();

    // input using the beg_end math delimiters
    const input = `
\\begin{equation}
  a^2 + b^2 = c^2
\\end{equation}
`;

    const output = md.render(input);

    // Check that the output contains KaTeX-rendered math HTML
    expect(output).toContain('<span class="katex-display">');
    expect(output).toContain('a^2');
    expect(output).toContain('b^2');
    expect(output).toContain('c^2');
  });
});
