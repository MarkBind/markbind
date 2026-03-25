import { injectTags } from '../lib/markdown-it/patches/custom-component/customComponentPlugin.js';
import { injectIgnoreTags } from './htmlparser2.js';

function ignoreTags(tagsToIgnore: Iterable<string>) {
  injectIgnoreTags(tagsToIgnore);
  injectTags(tagsToIgnore);
}

export { ignoreTags };
