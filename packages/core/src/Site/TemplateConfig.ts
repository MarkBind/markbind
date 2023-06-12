import { SiteConfigPage } from './SiteConfig';

type NunjuckVars = {
  variableName: string,
  fileSubstitutes: string[]
};

export type TemplateConfig = {
  nunjuckVars: NunjuckVars[],
  layoutNunjuck: string,
  layoutObjs: SiteConfigPage[],
  existingPageNames: string[]
};

const defaultTemplate: TemplateConfig = {
  nunjuckVars: [
    {
      variableName: 'siteNav',
      fileSubstitutes: ['_Sidebar.md'],
    },
    {
      variableName: 'footer',
      fileSubstitutes: ['_Footer.md'],
    },
  ],
  layoutNunjuck: 'siteConvertLayout.njk',
  layoutObjs: [
    { glob: '**/*.md', layout: 'default.md' },
    { glob: '404.md', layout: '404.md' },
  ],
  existingPageNames: ['Index', '404', 'Topic 1', 'Topic 2', 'Topic 3 A', 'Topic 3 B'],
};

const minimalTemplate: TemplateConfig = {
  nunjuckVars: [],
  layoutNunjuck: 'siteConvertLayout.njk',
  layoutObjs: [{ glob: '**/*.md', layout: 'default.md' }],
  existingPageNames: ['Index'],
};

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
