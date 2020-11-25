const { filter } = require('./nunjucks-date');
const { SetExternalExtension } = require('./set-external');

module.exports = {
  dateFilter: filter,
  SetExternalExtension,
};
