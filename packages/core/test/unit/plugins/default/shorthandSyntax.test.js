const cheerio = require('cheerio');
const shorthandSyntaxPlugin = require('../../../../src/plugins/default/markbind-plugin-shorthandSyntax');

test('processNode should convert shorthand syntax to proper Markbind syntax', () => {
  const [spanNode] = cheerio.parseHTML('<panel>'
    + '<span heading>Heading</span></panel>', true)[0].children;
  shorthandSyntaxPlugin.processNode({}, spanNode);
  expect(spanNode.type).toEqual('tag');
  expect(spanNode.name).toEqual('span');
  expect(spanNode.attribs.class).toEqual('card-title');
  expect(spanNode.attribs.slot).toEqual('header');
  expect(spanNode.children[0].data).toEqual('Heading');
  expect(spanNode.children[0].type).toEqual('text');
},
);

test('processNode should not convert span node without heading attribute', () => {
  const [spanNode] = cheerio.parseHTML('<panel>'
    + '<span>Heading</span></panel>', true)[0].children;
  const copy = { ...spanNode };
  shorthandSyntaxPlugin.processNode({}, spanNode);
  expect(spanNode).toEqual(copy);
},
);

test('processNode should not convert improper syntax nodes', () => {
  const [divSpanNode] = cheerio
    .parseHTML('<div><span heading>Heading</span></div>', true)[0].children;
  const divSpanNodeCopy = { ...divSpanNode };
  shorthandSyntaxPlugin.processNode({}, divSpanNode);
  expect(divSpanNode).toEqual(divSpanNodeCopy);

  const [panelH1Node] = cheerio
    .parseHTML('<panel><h1 heading>Heading</h1></panel>', true)[0].children;
  const panelH1NodeCopy = { ...panelH1Node };
  shorthandSyntaxPlugin.processNode({}, panelH1Node);
  expect(panelH1Node).toEqual(panelH1NodeCopy);
},
);
