// spy on gh-pages

const ghpages = {};

ghpages.publish = (dir, options, callback) => {
  // record arguments
  ghpages.dir = dir;
  ghpages.options = options;
  callback();
};

module.exports = ghpages;
