jest.mock('../../../src/plugins/PluginManager');
jest.mock('vue/compiler-sfc');
jest.mock('fs-extra');

describe('PageVueServerRenderer', () => {
  let pageVueServerRenderer: any;
  let PluginManager: any;
  let compileTemplate: any;

  beforeEach(async () => {
    jest.resetModules();

    // Re-acquire dependencies for the new module context (As Tags are cached in PluginManager)
    PluginManager = (await import('../../../src/plugins/PluginManager')).PluginManager;
    compileTemplate = (await import('vue/compiler-sfc')).compileTemplate;
    pageVueServerRenderer = (await import('../../../src/Page/PageVueServerRenderer')).pageVueServerRenderer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('compileVuePageCreateAndReturnScript', () => {
    test('correctly filters isCustomElement flag elements, '
        + 'passes to Vue compiler isCustomElement option', async () => {
      // Setup
      (PluginManager as any).tagConfig = {
        'my-custom-element': {
          isCustomElement: true,
          isSpecial: false,
          attributes: [],
        },
        'regular-element': {
          isCustomElement: false,
          isSpecial: false,
          attributes: [],
        },
      };

      (compileTemplate as jest.Mock).mockReturnValue({
        code: '/* compiled code */',
      });

      const pageConfig = {
        sourcePath: 'test.md',
        resultPath: 'test.html',
      };
      const pageAsset = {};

      // Execute
      await pageVueServerRenderer.compileVuePageCreateAndReturnScript(
        'content',
        pageConfig as any,
        pageAsset as any,
      );

      // Verify
      expect(compileTemplate).toHaveBeenCalled();

      const { compilerOptions } = (compileTemplate as jest.Mock).mock.calls[0][0];
      const { isCustomElement } = compilerOptions;

      expect(isCustomElement('my-custom-element')).toBe(true);
      expect(isCustomElement('regular-element')).toBe(false);
      expect(isCustomElement('div')).toBe(false);
    });

    test('handles empty tagConfig or tags without isCustomElement property', async () => {
      (PluginManager as any).tagConfig = {
        'some-tag': {
          isSpecial: false,
          attributes: [],
        },
      };

      (compileTemplate as jest.Mock).mockReturnValue({
        code: '/* compiled code */',
      });

      const pageConfig = { sourcePath: 'test.md', resultPath: 'test.html' };
      const pageAsset = {};

      await pageVueServerRenderer.compileVuePageCreateAndReturnScript(
        'content',
        pageConfig as any,
        pageAsset as any,
      );

      const { compilerOptions } = (compileTemplate as jest.Mock).mock.calls[0][0];
      const { isCustomElement } = compilerOptions;

      expect(isCustomElement('some-tag')).toBe(false);
      expect(isCustomElement('any-tag')).toBe(false);
    });
  });
});
