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
