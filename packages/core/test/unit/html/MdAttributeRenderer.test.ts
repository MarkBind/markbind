import { processCardStackAttributes } from '../../../src/html/cardStackProcessor.ts';
import { MbNode, parseHTML } from '../../../src/utils/node';

describe('processCardStackAttributes', () => {
  it('should do nothing when node has no children', () => {
    const node: MbNode = {
      type: 'tag',
      name: 'cardstack',
      attribs: {},
      children: undefined,
    } as MbNode;

    processCardStackAttributes(node);

    expect(node.attribs['data-tag-configs']).toBeUndefined();
  });

  it('should do nothing when there is no <tags> child element', () => {
    const html = '<cardstack><card header="Test">Content</card></cardstack>';
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    expect(cardstackNode.attribs['data-tag-configs']).toBeUndefined();
  });

  it('should parse <tags> element with single tag config', () => {
    const html = `<cardstack>
      <tags>
        <tag name="Success" color="#28a745"></tag>
      </tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    expect(cardstackNode.attribs['data-tag-configs']).toBeDefined();
    const decodedConfig = cardstackNode.attribs['data-tag-configs']
      .replace(/&quot;/g, '"');
    const parsed = JSON.parse(decodedConfig);
    expect(parsed).toEqual([{ name: 'Success', color: '#28a745' }]);
  });

  it('should parse <tags> element with multiple tag configs', () => {
    const html = `<cardstack>
      <tags>
        <tag name="Success" color="#28a745"></tag>
        <tag name="Failure" color="#dc3545"></tag>
        <tag name="Neutral" color="#6c757d"></tag>
      </tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    expect(cardstackNode.attribs['data-tag-configs']).toBeDefined();
    const decodedConfig = cardstackNode.attribs['data-tag-configs']
      .replace(/&quot;/g, '"');
    const parsed = JSON.parse(decodedConfig);
    expect(parsed).toEqual([
      { name: 'Success', color: '#28a745' },
      { name: 'Failure', color: '#dc3545' },
      { name: 'Neutral', color: '#6c757d' },
    ]);
  });

  it('should parse tags with Bootstrap color names', () => {
    const html = `<cardstack>
      <tags>
        <tag name="Success" color="success"></tag>
        <tag name="Danger" color="danger"></tag>
      </tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    const decodedConfig = cardstackNode.attribs['data-tag-configs']
      .replace(/&quot;/g, '"');
    const parsed = JSON.parse(decodedConfig);
    expect(parsed).toEqual([
      { name: 'Success', color: 'success' },
      { name: 'Danger', color: 'danger' },
    ]);
  });

  it('should parse tags without color attribute', () => {
    const html = `<cardstack>
      <tags>
        <tag name="Success"></tag>
        <tag name="Failure" color="#dc3545"></tag>
      </tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    const decodedConfig = cardstackNode.attribs['data-tag-configs']
      .replace(/&quot;/g, '"');
    const parsed = JSON.parse(decodedConfig);
    expect(parsed).toEqual([
      { name: 'Success' },
      { name: 'Failure', color: '#dc3545' },
    ]);
  });

  it('should ignore <tag> elements without name attribute', () => {
    const html = `<cardstack>
      <tags>
        <tag color="#28a745"></tag>
        <tag name="Valid" color="#dc3545"></tag>
      </tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    expect(cardstackNode.attribs['data-tag-configs']).toBeDefined();
    const decodedConfig = cardstackNode.attribs['data-tag-configs']
      .replace(/&quot;/g, '"');
    const parsed = JSON.parse(decodedConfig);
    expect(parsed).toEqual([{ name: 'Valid', color: '#dc3545' }]);
  });

  it('should remove the <tags> node from the DOM tree', () => {
    const html = `<cardstack>
      <tags>
        <tag name="Success" color="#28a745"></tag>
      </tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;
    const initialChildCount = cardstackNode.children?.length || 0;

    processCardStackAttributes(cardstackNode);

    // Should have removed the <tags> element
    const hasTagsNode = cardstackNode.children?.some(
      child => child.type === 'tag' && (child as MbNode).name === 'tags',
    );
    expect(hasTagsNode).toBe(false);
    expect((cardstackNode.children?.length || 0)).toBeLessThan(initialChildCount);
  });

  it('should escape HTML entities in the data attribute', () => {
    const html = `<cardstack>
      <tags>
        <tag name="Test<>&" color="#28a745"></tag>
      </tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    const dataAttr = cardstackNode.attribs['data-tag-configs'];
    // Should contain escaped quotes
    expect(dataAttr).toContain('&quot;');
    // Should contain escaped HTML entities for the tag name
    expect(dataAttr).toContain('&lt;');
    expect(dataAttr).toContain('&gt;');
  });

  it('should handle empty <tags> element', () => {
    const html = `<cardstack>
      <tags></tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    // Should remove tags node but not add data-tag-configs since no tags were found
    expect(cardstackNode.attribs['data-tag-configs']).toBeUndefined();
    const hasTagsNode = cardstackNode.children?.some(
      child => child.type === 'tag' && (child as MbNode).name === 'tags',
    );
    expect(hasTagsNode).toBe(false);
  });

  it('should handle <tags> with non-tag children', () => {
    const html = `<cardstack>
      <tags>
        <tag name="Valid" color="#28a745"></tag>
        <div>Invalid</div>
        <tag name="AnotherValid" color="#dc3545"></tag>
      </tags>
      <card header="Test">Content</card>
    </cardstack>`;
    const nodes = parseHTML(html);
    const cardstackNode = nodes[0] as MbNode;

    processCardStackAttributes(cardstackNode);

    const decodedConfig = cardstackNode.attribs['data-tag-configs']
      .replace(/&quot;/g, '"');
    const parsed = JSON.parse(decodedConfig);
    // Should only include the <tag> elements, not <div>
    expect(parsed).toEqual([
      { name: 'Valid', color: '#28a745' },
      { name: 'AnotherValid', color: '#dc3545' },
    ]);
  });
});
