const cheerio = require('cheerio');
const mermaidPlugin = require('../../../src/plugins/mermaid');

/*
The plugin converts the following mermaid syntax:
<mermaid>
flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
</mermaid>
to
<div class="mermaid">
flowchart TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    C --> D[Rethink]
    D --> B
    B ---->|No| E[End]
</div>
which will be further converted to the actual diagram by the mermaid library.
*/
test('processNode should work with flowchart', () => {
  const raw = '<mermaid>'
    + 'flowchart TD\n'
    + '  A[Start] --> B{Is it?}\n'
    + '  B -->|Yes| C[OK]\n'
    + '  C --> D[Rethink]\n'
    + '  D --> B\n'
    + '  B ---->|No| E[End]\n'
    + '</mermaid>';
  const expected = '<div class="mermaid">'
    + 'flowchart TD\n'
    + '  A[Start] --> B{Is it?}\n'
    + '  B -->|Yes| C[OK]\n'
    + '  C --> D[Rethink]\n'
    + '  D --> B\n'
    + '  B ---->|No| E[End]\n'
    + '</div>';
  const [expectedNode] = cheerio.parseHTML(expected, true);
  const [rawNode] = cheerio.parseHTML(raw, true);
  mermaidPlugin.processNode({}, rawNode);
  expect(rawNode.name).toEqual('div');
  expect(rawNode.attribs.class).toEqual('mermaid');
  expect(rawNode.children[0].data).toEqual(expectedNode.children[0].data);
});

test('getScripts should work with pluginContext', () => {
  const pluginContext = {
    address: 'https://unpkg.com/mermaid@8/dist/mermaid.esm.min.mjs',
    config: '{"startOnLoad":false}',
  };
  const expected = `<script type="module">
import mermaid from '${pluginContext.address}';
mermaid.initialize(${JSON.stringify(pluginContext.config)});
</script>`;
  const scripts = mermaidPlugin.getScripts(pluginContext);
  expect(scripts.length).toEqual(1);
  expect(scripts[0]).toEqual(expected);
});
