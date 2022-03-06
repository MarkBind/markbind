/**
 * Creates tree-like visualizations
 * Replaces <tree> tags with <p> tags with the appropriate textual representation
 * Typically used for folder structures visualizations
 */

const _ = {};
_.has = require('lodash/has');

const CSS_FILE_NAME = 'markbind-plugin-tree.css';

const TOKEN = {
  CHILD: '├── ',
  LAST_CHILD: '└── ',
  DIRECTORY: '│   ',
  EMPTY: '    ',
};

class TreeNode {
  constructor(content, parent, children, level) {
    this.content = content;
    this.parent = parent;
    this.children = children;
    this.level = level;
  }

  isLastChild() {
    return this.parent.children[this.parent.children.length - 1] === this;
  }

  static getLevel(line) {
    // every 2 spaces from the start of the line means 1 level
    return Math.floor(line.match(/^\s*/)[0].length / 2);
  }

  static getContent(line) {
    return line.trim();
  }

  static parse(text) {
    const lines = text.split('\n');
    const rootNode = new TreeNode('root', null, [], -1);
    const prevParentStack = [rootNode];
    let prevParent = rootNode;
    let prevLevel = -1;
    let prevNode = rootNode;
    lines
      .filter(line => line.trim() !== '')
      .forEach((line) => {
        const level = TreeNode.getLevel(line);
        const content = TreeNode.getContent(line);
        let newNode;
        if (level > prevLevel) {
          // new child
          prevParentStack.push(prevNode);
          prevParent = prevNode;
          newNode = new TreeNode(content, prevParent, [], level);
        } else if (level === prevLevel) {
          // new sibling
          newNode = new TreeNode(content, prevParent, [], level);
        } else {
          // new parent
          for (let i = 0; i < prevLevel - level; i += 1) {
            prevParentStack.pop();
          }
          prevParent = prevParentStack[prevParentStack.length - 1];
          newNode = new TreeNode(content, prevParent, [], level);
        }
        prevParent.children.push(newNode);
        prevLevel = level;
        prevNode = newNode;
      });
    return rootNode;
  }

  static _getPositionalToken(parent, child) {
    const idx = parent.children.findIndex(node => node === child);
    if (parent.parent === null) {
      return '';
    }
    if (idx === -1) {
      throw new Error('child not found');
    } else if (idx < parent.children.length - 1) {
      return TOKEN.CHILD;
    } else {
      return TOKEN.LAST_CHILD;
    }
  }

  static _dfsHelper(currNode, arr) {
    if (!currNode) {
      return;
    }
    if (currNode.parent !== null) {
      const tokens = [
        '\n',
        currNode.content,
        TreeNode._getPositionalToken(currNode.parent, currNode),
      ];
      let curr = currNode.parent;
      while (_.has(curr, 'parent.parent')) {
        tokens.push(curr.isLastChild() ? TOKEN.EMPTY : TOKEN.DIRECTORY);
        curr = curr.parent;
      }
      arr.push(tokens.reverse().join(''));
    }
    currNode.children.forEach((child) => {
      TreeNode._dfsHelper(child, arr);
    });
  }

  static visualize(text) {
    const rootNode = TreeNode.parse(text);
    const treeTokens = [];
    TreeNode._dfsHelper(rootNode, treeTokens);
    return treeTokens.join('');
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
    node.name = 'p';
    node.attribs.class = node.attribs.class ? `${node.attribs.class} tree` : 'tree';
    node.children[0].data = TreeNode.visualize(node.children[0].data);
  },
};
