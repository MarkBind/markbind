import { PluginContext } from './Plugin.js';

/**
 * CustardUI Plugin for MarkBind
 * Injects the CustardUI auto-init script into every page.
 */

const getScripts = (pluginContext: PluginContext) => {
  const baseUrl = pluginContext?.baseUrl || '/';
  return [
    // Latest Stable Release
    '<script src="https://cdn.jsdelivr.net/npm/@custardui/custardui@latest" '
      + `data-base-url="${baseUrl}"></script>`,
  ];
};

const tagConfig = {
  'cv-toggle': { isCustomElement: true },
  'cv-toggle-control': { isCustomElement: true },
  'cv-tabgroup': { isCustomElement: true },
  'cv-tab': { isCustomElement: true },
  'cv-tab-body': { isCustomElement: true },
  'cv-tab-header': { isCustomElement: true },
  'cv-define-placeholder': { isCustomElement: true },
  'cv-placeholder-input': { isCustomElement: true },
  'cv-label': { isCustomElement: true },
  'cv-insertion': { isCustomElement: true },
};

export { getScripts, tagConfig };
