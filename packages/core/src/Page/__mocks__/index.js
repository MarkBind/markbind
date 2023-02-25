// mock generate

const Page = jest.genMockFromModule('../index');

Page.generate = () => Promise.resolve('');

module.exports = Page;
