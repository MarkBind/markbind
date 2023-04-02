import path from 'path';
import childProcess, { ChildProcess } from 'child_process';
import { jest } from '@jest/globals';
import fs from 'fs';

import plantumlPlugin from '../../../../src/plugins/default/markbind-plugin-plantuml';
import { MbNode, parseHTML } from '../../../../src/utils/node';
import { NodeProcessorConfig } from '../../../../src/html/NodeProcessor';

const mockReadFileSync = jest.spyOn(fs, 'readFileSync');
const mockExec = jest.spyOn(childProcess, 'exec').mockImplementation(() => {
  const childProc = {
    stdin: { write: jest.fn() },
    on: jest.fn(),
    stderr: { on: jest.fn() },
  } as unknown as ChildProcess;
  return childProc;
});

const mockFolderPath = path.join(__dirname, '_plantuml');
const mockConfig: NodeProcessorConfig = {
  outputPath: mockFolderPath,
  baseUrl: '',
  rootPath: mockFolderPath,
  baseUrlMap: new Set<string>(),
  ignore: [],
  addressablePagesSource: [],
  intrasiteLinkValidation: {
    enabled: false,
  },
  codeLineNumbers: false,
  plantumlCheck: false,
  headerIdMap: {},
};

test('processNode should modify inline puml node correctly', () => {
  const expectedPicSrc = '/a31b4068deea63d65d1259b4d54bcc79.png';
  const [pumlNode] = parseHTML('<puml width=300>\n@startuml\n'
    + 'alice -> bob ++ : hello\n'
    + 'bob -> bob ++ : self call\n'
    + '@enduml\n</puml>') as MbNode[];
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
  const [pumlNode] = parseHTML('<puml name="alice">\n@startuml\n'
    + 'alice -> bob ++ : hello\n'
    + 'bob -> bob ++ : self call\n'
    + '@enduml\n</puml>') as MbNode[];
  plantumlPlugin.processNode({}, pumlNode, mockConfig);
  expect(mockExec).toHaveBeenCalled();
  expect(pumlNode.type).toEqual('tag');
  expect(pumlNode.name).toEqual('pic');
  expect(pumlNode.attribs.src).toEqual(expectedPicSrc);
},
);

test('processNode should modify puml node (with src) correctly', () => {
  const expectedPicSrc = 'activity.png';
  const [pumlNode] = parseHTML('<puml src="activity.puml" />') as MbNode[];
  plantumlPlugin.processNode({}, pumlNode, mockConfig);
  expect(mockReadFileSync).toHaveBeenCalled();
  expect(pumlNode.type).toEqual('tag');
  expect(pumlNode.name).toEqual('pic');
  expect(pumlNode.attribs.src).toEqual(expectedPicSrc);
},
);

test('processNode should not modify non-puml node', () => {
  const divNode = parseHTML('<div>HTML</div>')[0] as MbNode;
  const copy = { ...divNode };
  plantumlPlugin.processNode({}, divNode, mockConfig);
  expect(divNode).toEqual(copy);
},
);
