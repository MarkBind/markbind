import { compileTemplate } from 'vue/compiler-sfc';
import { pageVueServerRenderer } from '../../../src/Page/PageVueServerRenderer';
import { PluginManager } from '../../../src/plugins/PluginManager';

jest.mock('../../../src/plugins/PluginManager');
jest.mock('vue/compiler-sfc');
jest.mock('fs-extra');

describe('PageVueServerRenderer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('compileVuePageCreateAndReturnScript', () => {
    test('passes isCustomElement tags to isCustomElement compiler option', async () => {
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
  });
});
