import { SiteConfigPage } from './SiteConfig';

type NjkFileVars = {
  variableName: string,
  fileSubstitutes: string[]
};

export type TemplateConfig = {
  njkSubs: NjkFileVars[],
  njkFile: string,
  layoutObjs: SiteConfigPage[],
  hasAutoSiteNav: boolean,
  siteNavIgnore?: string[]
};

const defaultTemplate: TemplateConfig = {
  njkSubs: [
    {
      variableName: 'siteNav',
      fileSubstitutes: ['_Sidebar.md'],
    },
    {
      variableName: 'footer',
      fileSubstitutes: ['_Footer.md'],
    },
  ],
  njkFile: 'defaultLayout.njk',
  layoutObjs: [
    { glob: '**/*.md', layout: 'default.md' },
    { glob: '404.md', layout: '404.md' },
  ],
  hasAutoSiteNav: true,
  siteNavIgnore: [
    'index.md', '404.md',
    'contents/topic1.md', 'contents/topic2.md', 'contents/topic3a.md', 'contents/topic3b.md',
  ],
};

const minimalTemplate: TemplateConfig = {
  njkSubs: [],
  njkFile: 'minimalLayout.njk',
  layoutObjs: [{ glob: '**/*.md', layout: 'default.md' }],
  hasAutoSiteNav: false,
};

/**
 * Retrieves a pre-defined template configuration based on the name.
 *
 * @param name The name of a template configuration
 * @returns The pre-defined template configuration based on the name.
 */
export const getTemplateConfig = (name: string) => {
  switch (name) {
  case 'default':
    return defaultTemplate;
  case 'minimal':
    return minimalTemplate;
  default:
    throw new Error('Template configuration not found.');
  }
};
