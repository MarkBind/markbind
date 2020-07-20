// mock generate

const Page = jest.genMockFromModule('../index');

Page.prototype.generate = () => Promise.resolve('');

module.exports = Page;
