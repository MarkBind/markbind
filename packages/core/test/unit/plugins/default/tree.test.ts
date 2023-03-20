import treePlugin from '../../../../src/plugins/default/markbind-plugin-tree';
import { MbNode, parseHTML } from '../../../../src/utils/node';

/*
The plugin converts the following tree syntax:
<tree>
C:/course/
  textbook/
    index.md
  index.md
  reading.md
  site.json
</tree>
to
<div class="tree">
C:/course/
├── textbook/
│   └── index.md
├── index.md
├── reading.md
└── site.json
</div>
*/
test('processNode should work with multiple trees', () => {
  const raw = '<tree>'
    + 'C:/course/\n'
    + '  textbook/\n'
    + '    index.md\n'
    + 'C:/course/\n'
    + '  textbook/\n'
    + '    index.md\n'
    + '</tree>';
  const expected = '<div class="tree">'
    + 'C:/course/\n'
    + '└── textbook/\n'
    + '    └── index.md\n'
    + 'C:/course/\n'
    + '└── textbook/\n'
    + '    └── index.md\n'
    + '</div>';
  const [expectedTreeNode] = parseHTML(expected) as MbNode[];
  const [treeNode] = parseHTML(raw) as MbNode[];
  treePlugin.processNode({}, treeNode);
  expect(treeNode.name).toEqual('div');
  expect(treeNode.attribs.class).toEqual('tree');
  expect(expectedTreeNode.children[0].data).toEqual(treeNode.children[0].data);
},
);
