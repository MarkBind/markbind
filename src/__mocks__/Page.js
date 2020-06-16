// mock generate

const Page = jest.genMockFromModule('../Page');

Page.prototype.generate = () => Promise.resolve('');

module.exports = Page;
