const cheerio = require('cheerio');

const _ = {};
_.pick = require('lodash/pick');

module.exports = {
  createErrorNode(element, error) {
    const errorElement = cheerio.parseHTML(
      `<div style="color: red">${error.message}</div>`, true)[0];
    return Object.assign(element, _.pick(errorElement, ['name', 'attribs', 'children']));
  },

  createEmptyNode() {
    return cheerio.parseHTML('<div></div>', true)[0];
  },

  createSlotTemplateNode(slotName, content) {
    return cheerio.parseHTML(`<template #{slotName}>${content}</template>`, true);
  },
};
