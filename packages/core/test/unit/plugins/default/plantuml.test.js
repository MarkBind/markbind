const cheerio = require('cheerio');
const path = require('path');
const childProcess = require('child_process');
const fs = require('fs');

const mockReadFileSync = jest.spyOn(fs, 'readFileSync');
const mockExec = jest.spyOn(childProcess, 'exec').mockImplementation(() => ({
  stdin: { write: jest.fn() },
  on: jest.fn(),
  stderr: { on: jest.fn() },
}),
);

const plantumlPlugin = require('../../../../src/plugins/default/markbind-plugin-plantuml');

const mockConfig = {
  outputPath: path.resolve('_plantuml'),
  baseUrl: '',
  rootPath: path.join(__dirname, '_plantuml'),
};

test('processNode should modify inline puml node correctly', () => {
  const expectedPicSrc = '/a31b4068deea63d65d1259b4d54bcc79.png';
  const [pumlNode] = cheerio.parseHTML('<puml width=300>\n@startuml\n'
    + 'alice -> bob ++ : hello\n'
    + 'bob -> bob ++ : self call\n'
    + '@enduml\n</puml>', true);
  plantumlPlugin.processNode({}, pumlNode, mockConfig);
  expect(mockExec).toHaveBeenCalled();
  expect(pumlNode.type).toEqual('tag');
  expect(pumlNode.name).toEqual('pic');
  expect(pumlNode.attribs.width).toEqual('300');
  expect(pumlNode.attribs.src).toEqual(expectedPicSrc);
},
);

test('processNode should modify inline puml node (with name) correctly', () => {
  const expectedPicSrc = '/alice.png';
  const [pumlNode] = cheerio.parseHTML('<puml name="alice">\n@startuml\n'
    + 'alice -> bob ++ : hello\n'
    + 'bob -> bob ++ : self call\n'
    + '@enduml\n</puml>', true);
  plantumlPlugin.processNode({}, pumlNode, mockConfig);
  expect(mockExec).toHaveBeenCalled();
  expect(pumlNode.type).toEqual('tag');
  expect(pumlNode.name).toEqual('pic');
  expect(pumlNode.attribs.src).toEqual(expectedPicSrc);
},
);

test('processNode should modify puml node (with src) correctly', () => {
  const expectedPicSrc = 'activity.png';
  const [pumlNode] = cheerio.parseHTML('<puml src="activity.puml" />', true);
  plantumlPlugin.processNode({}, pumlNode, mockConfig);
  expect(mockReadFileSync).toHaveBeenCalled();
  expect(pumlNode.type).toEqual('tag');
  expect(pumlNode.name).toEqual('pic');
  expect(pumlNode.attribs.src).toEqual(expectedPicSrc);
},
);

test('processNode should not modify non-puml node', () => {
  const divNode = cheerio.parseHTML('<div>HTML</div>', true)[0];
  const copy = { ...divNode };
  plantumlPlugin.processNode({}, divNode);
  expect(divNode).toEqual(copy);
},
);
