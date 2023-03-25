import shorthandSyntaxPlugin from '../../../../src/plugins/default/markbind-plugin-shorthandSyntax';
import { MbNode, parseHTML } from '../../../../src/utils/node';

/*
The plugin converts the following shorthand syntax:
<panel>
    <span heading>
        Heading
    </span>
</panel>
to
<panel>
    <span slot="header" class="card-title">
        Heading
    </span>
</panel>
*/
test('processNode should convert shorthand syntax to proper MarkBind syntax', () => {
  const [spanNode] = parseHTML('<panel><span heading>Heading</span></panel>')[0].children as MbNode[];
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
  const [spanNode] = parseHTML('<panel><span>Heading</span></panel>')[0].children as MbNode[];
  const copy = { ...spanNode };
  shorthandSyntaxPlugin.processNode({}, spanNode);
  expect(spanNode).toEqual(copy);
},
);

test('processNode should not convert div>span[heading] syntax nodes', () => {
  const [divSpanNode] = parseHTML('<div><span heading>Heading</span></div>')[0].children as MbNode[];
  const divSpanNodeCopy = { ...divSpanNode };
  shorthandSyntaxPlugin.processNode({}, divSpanNode);
  expect(divSpanNode).toEqual(divSpanNodeCopy);
},
);

test('processNode should not convert panel>h1[heading] syntax nodes', () => {
  const [panelH1Node] = parseHTML('<panel><h1 heading>Heading</h1></panel>')[0].children as MbNode[];
  const panelH1NodeCopy = { ...panelH1Node };
  shorthandSyntaxPlugin.processNode({}, panelH1Node);
  expect(panelH1Node).toEqual(panelH1NodeCopy);
},
);
