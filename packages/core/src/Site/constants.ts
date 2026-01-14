import difference from 'lodash/difference';
import differenceWith from 'lodash/differenceWith';
import flatMap from 'lodash/flatMap';
import has from 'lodash/has';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isUndefined from 'lodash/isUndefined';
import noop from 'lodash/noop';
import omitBy from 'lodash/omitBy';
import startCase from 'lodash/startCase';
import union from 'lodash/union';
import uniq from 'lodash/uniq';

export const INDEX_MARKDOWN_FILE = 'index.md';
export const SITE_CONFIG_NAME = 'site.json';
export const LAZY_LOADING_SITE_FILE_NAME = 'LazyLiveReloadLoadingSite.html';
export const TEMPLATE_SITE_ASSET_FOLDER_NAME = 'markbind';

export const CONFIG_FOLDER_NAME = '_markbind';
export const SITE_FOLDER_NAME = '_site';
export const TEMP_FOLDER_NAME = '.temp';
export const LAYOUT_SITE_FOLDER_NAME = 'layouts';
export const FAVICON_DEFAULT_PATH = 'favicon.ico';
export const USER_VARIABLES_PATH = '_markbind/variables.md';
export const PAGE_TEMPLATE_NAME = 'page.njk';
export const SITE_DATA_NAME = 'siteData.json';

export const _ = {
  difference,
  differenceWith,
  flatMap,
  has,
  isUndefined,
  isEqual,
  isEmpty,
  isBoolean,
  noop,
  omitBy,
  startCase,
  union,
  uniq,
};
