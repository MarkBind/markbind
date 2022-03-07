/**
 * Creates tree-like visualisations.
 * Transforms the content in <tree> tags into corresponding textual representations
 * that are easier to visualise the relationships.
 * A common use case is folder structures visualisations.
 */
const _ = {};
_.has = require('lodash/has');
const md = require('../../lib/markdown-it');

const CSS_FILE_NAME = 'markbind-plugin-tree.css';

const TOKEN = {
  child: '├── ',
  lastChild: '└── ',
  connector: '│   ',
  space: '    ',
};

class TreeNode {
  constructor(content, parent, children, level) {
    this.content = content;
    this.parent = parent;
    this.children = children;
    this.level = level;
  }

  /**
   * Returns true if this node is the last child of its parent.
   * A root node is considered to be the last child.
   * This is used to determine the correct connector to use.
   * @return {boolean}
   */
  isLastChild() {
    if (this.parent === null) {
      return true;
    }
    return this.parent.children[this.parent.children.length - 1] === this;
  }

  /**
   * Returns the token to append before the content.
   * @return {string}
   */
  getPositionalToken() {
    return this.isLastChild() ? TOKEN.lastChild : TOKEN.child;
  }

  /**
   * Determines the level of a line.
   * Every 2 spaces from the start of the line means 1 level.
   * The root node is level 0.
   * @return {number}
   */
  static levelize(line) {
    return Math.floor(line.match(/^\s*/)[0].length / 2);
  }

  /**
   * Returns formatted TreeNode content.
   * Removes dashes (-), asterisks (*), or plus signs (+) at the beginning of the line
   * @return {string}
   */
  static getContent(raw) {
    return raw.trim().replace(/^[-+*]\s/, '');
  }

  /**
   * Creates TreeNode objects from the raw text.
   * @param {string} raw - The raw text to parse.
   * @return {TreeNode} - The dummy root node of the tree.
   */
  static parse(raw) {
    const lines = raw.split('\n').filter(line => line.trim() !== '');
    const rootNode = new TreeNode('.', null, [], -1); // dummy root node
    const prevParentStack = [rootNode];
    let prevLevel = rootNode.level;
    let prevParent = rootNode;
    let prevNode = rootNode;
    lines
      .forEach((line) => {
        const level = TreeNode.levelize(line);
        const content = TreeNode.getContent(line);

        if (level > prevLevel) {
          prevParentStack.push(prevNode);
          prevParent = prevNode;
        } else if (level < prevLevel) {
          for (let i = 0; i < prevLevel - level; i += 1) {
            prevParentStack.pop();
          }
          prevParent = prevParentStack[prevParentStack.length - 1];
        }

        const newNode = new TreeNode(content, prevParent, [], level);
        prevParent.children.push(newNode);
        prevLevel = level;
        prevNode = newNode;
      });
    return rootNode;
  }

  /**
   * Traverses the tree and appends the tokens to the given array.
   * @param {TreeNode} node - The node to traverse.
   * @param {Array} treeTokens - The array to append the tokens to.
   */
  static traverse(currNode, result) {
    if (!currNode.children) {
      return;
    }
    if (currNode.parent === null) {
      result.push(md.renderInline(`${currNode.content}\n`));
    } else {
      const tokens = [
        '\n',
        md.renderInline(currNode.content),
        currNode.getPositionalToken(),
      ];

      // computes the strings appended to the content of the TreeNode
      let curr = currNode.parent;
      while (_.has(curr, 'parent.parent')) {
        tokens.push(curr.isLastChild() ? TOKEN.space : TOKEN.connector);
        curr = curr.parent;
      }

      result.push(tokens.reverse().join(''));
    }
    currNode.children.forEach((child) => {
      TreeNode.traverse(child, result);
    });
  }

  /**
   * Returns the TreeNode as a string.
   * This assumes that the node is a root node.
   * @return {string}
   */
  toString() {
    const treeTokens = [];
    TreeNode.traverse(this, treeTokens);
    return treeTokens.join('');
  }

  /**
   * Returns the rendered tree.
   * @param {string} raw - The raw text to parse.
   * @return {string}
   */
  static visualize(raw) {
    const dummyRootNode = TreeNode.parse(raw);
    return dummyRootNode.children
      .reduce((prev, curr) => {
        curr.parent = null;
        return prev + curr.toString();
      }, '');
  }
}

module.exports = {
  tagConfig: {
    tree: {
      isSpecial: true,
    },
  },
  getLinks: () => [`<link rel="stylesheet" href="${CSS_FILE_NAME}">`],
  processNode: (pluginContext, node) => {
    if (node.name !== 'tree') {
      return;
    }
    node.name = 'div';
    node.attribs.class = node.attribs.class ? `${node.attribs.class} tree` : 'tree';
    node.children[0].data = TreeNode.visualize(node.children[0].data);
  },
};
