// spy on gh-pages
var ghpages = {};
ghpages.publish = function (dir, options, callback) {
    // record arguments
    ghpages.dir = dir;
    ghpages.options = options;
    callback();
};
module.exports = ghpages;
