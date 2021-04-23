// mock generate
var Page = jest.genMockFromModule('../index');
Page.prototype.generate = function () { return Promise.resolve(''); };
module.exports = Page;
