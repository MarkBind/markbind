const dayjs = require('dayjs');
const AdvancedFormat = require('dayjs/plugin/advancedFormat');

dayjs.extend(AdvancedFormat);

const DEFAULT_FORMAT = 'ddd D MMM'; // e.g. Thu 27 Aug

/**
 * Calculates the result of adding {days} days to the base date
 * @param base
 * @param days
 */
function calculateTarget(base, days) {
  return dayjs(base).add(days, 'days');
}

function filter(baseDate, format = DEFAULT_FORMAT, day = 0) {
  return calculateTarget(baseDate, day).format(format);
}

module.exports = {
  filter,
};
