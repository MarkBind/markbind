var Moment = require('moment');
var DEFAULT_FORMAT = 'ddd D MMM'; // e.g. Thu 27 Aug
/**
 * Calculates the result of adding {days} days to the base date
 * @param base
 * @param days
 */
function calculateTarget(base, days) {
    return Moment(base).add(days, 'days');
}
function filter(baseDate, format, day) {
    if (format === void 0) { format = DEFAULT_FORMAT; }
    if (day === void 0) { day = 0; }
    return calculateTarget(baseDate, day).format(format);
}
module.exports = {
    filter: filter,
};
