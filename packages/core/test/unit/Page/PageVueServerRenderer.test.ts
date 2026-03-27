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
    PluginManager = (await import('../../../src/plugins/PluginManager.js')).PluginManager;
    compileTemplate = (await import('vue/compiler-sfc')).compileTemplate;
    pageVueServerRenderer
      = (await import('../../../src/Page/PageVueServerRenderer.js')).pageVueServerRenderer;
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
        },
        'regular-element': {
          isCustomElement: false,
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
          // isSpecial and attributes are optional now
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

  describe('requireFromStringMethod', () => {
    test('imports CJS javascript code', () => {
      const src = `
          require('node:fs');
          
          function helloWorld() {
            return 'Hello World!';
          }
          module.exports = { helloWorld };
      `;

      const module = pageVueServerRenderer.requireFromString(src);

      // Assert that helloWorld method is present in module object
      expect('helloWorld' in module).toBe(true);
    });

    test('imports a mock Vue bundle', () => {
      const mockVueBundle = `
        const Vue = require('vue');
        
        const MarkBindVue = {
          plugin: {
            install: function(app) {
              app.config.globalProperties.$test = 'test';
            }
          }
        };
        
        const appFactory = function() {
          return {
            data() {
              return { test: 'value' };
            }
          };
        };
        
        module.exports = { MarkBindVue, appFactory };
      `;

      const module = pageVueServerRenderer.requireFromString(mockVueBundle);
      const appFactory = module.appFactory();

      // Assert that bundle contains expected properties
      expect(module).toHaveProperty('MarkBindVue');
      expect(module).toHaveProperty('appFactory');
      expect(typeof module.MarkBindVue.plugin.install).toBe('function');
      expect(typeof module.appFactory).toBe('function');
      expect(appFactory).toBeDefined();
    });

    test('executes gracefully with invalid code', () => {
      const invalidSrc = `
     (defun hello-world ()
        (format t "hello world"))

      (hello-world) 
      `;

      // Act: Invalid src should execute and not throw exceptions
      const module = pageVueServerRenderer.requireFromString(invalidSrc);

      // Assert that module has no exports
      // (logger should inform of error)
      expect(module).toEqual({});
    });
  });
});
