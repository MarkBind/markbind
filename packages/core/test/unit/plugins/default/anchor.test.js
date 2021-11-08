const cheerio = require('cheerio');
const anchorsPlugin = require('../../../../src/plugins/default/markbind-plugin-anchors');

test('getLinks should return the expected link in an array', () => {
  const links = anchorsPlugin.getLinks();
  expect(links).toEqual(['<link rel="stylesheet" href="markbind-plugin-anchors.css">']);
},
);

test('postProcessNode should append anchor-related HTML to heading nodes', () => {
  const [h1Node] = cheerio.parseHTML('<h1 id="h1-node">'
    + '<span id="h1-node" class="anchor"></span>should have anchor</h1>', true);
  const [h6Node] = cheerio.parseHTML('<h6 id="h6-node">'
    + '<span id="h6-node" class="anchor"></span>should have anchor</h6>', true);
  [h1Node, h6Node]
    .forEach((node) => {
      anchorsPlugin.postProcessNode({}, node);
      const addedHeadingNode = node.children.pop();
      expect(addedHeadingNode.type).toEqual('tag');
      expect(addedHeadingNode.name).toEqual('a');
      expect(addedHeadingNode.attribs.class).toEqual('fa fa-anchor');
      expect(addedHeadingNode.attribs.href).toEqual(`#${node.attribs.id}`);
      expect(addedHeadingNode.attribs.onclick).toEqual('event.stopPropagation()');
      expect(addedHeadingNode.children.length).toEqual(0);
    });
},
);

test('postProcessNode should not append anchor-related HTML to non-heading nodes', () => {
  const divNode = cheerio.parseHTML('<div id="div-node">'
    + '<span id="div-node" class="anchor"></span>should have anchor</div>', true)[0];
  const copy = { ...divNode };
  anchorsPlugin.postProcessNode({}, divNode);
  expect(divNode).toEqual(copy);
},
);

test('postProcessNode should not append anchor-related HTML to heading node without id', () => {
  const h1NodeWithoutId = cheerio.parseHTML('<h1>'
    + '<span id="h1-node" class="anchor"></span>should have anchor</h1>', true)[0];
  const copy = { ...h1NodeWithoutId };
  anchorsPlugin.postProcessNode({}, h1NodeWithoutId);
  expect(h1NodeWithoutId).toEqual(copy);
},
);
