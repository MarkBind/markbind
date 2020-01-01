module.exports = {
  // src/lib/markbind/src/parser.js
  ATTRIB_INCLUDE_PATH: 'include-path',
  ATTRIB_CWF: 'cwf',
  ATTRIB_RESULT_PATH: 'resultPath',

  BOILERPLATE_FOLDER_NAME: '_markbind/boilerplates',

  /* Imported global variables will be assigned a namespace.
   * A prefix is appended to reduce clashes with other variables in the page.
   */
  IMPORTED_VARIABLE_PREFIX: '$__MARKBIND__',

  // src/lib/markbind/src/utils.js
  markdownFileExts: ['md', 'mbd', 'mbdf'],
};
