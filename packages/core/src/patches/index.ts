import { injectTags } from '../lib/markdown-it/patches/custom-component/customComponentPlugin';
import { injectIgnoreTags } from './htmlparser2';

function ignoreTags(tagsToIgnore: Iterable<string>) {
  injectIgnoreTags(tagsToIgnore);
  injectTags(tagsToIgnore);
}

export = {
  ignoreTags,
};
