// This file manipulates the content of the printed page by defining print event listeners.

const PAGE_NAV_ID = 'mb-page-nav';
const PAGE_NAV_CLONE_CLASS = 'page-nav-clone';
const PAGE_NAV_PRINT_CONTAINER = 'page-nav-print';

/**
 * Remove the active style to prevent item highlighting.
 * @param {HTMLElement} node
 */
function removeActiveStyle(container) {
  const activeElements = container.querySelectorAll('a.active');
  activeElements.forEach((activeElement) => {
    activeElement.classList.remove('active');
  });
}

/**
 * Create deep copies of the page navigation.
 * @param {HTMLElement} node
 * @returns {HTMLElement} node
 */
function clonePageNav(node) {
  const pageNav = node.cloneNode(true);

  pageNav.removeAttribute('id'); // avoid duplicate
  removeActiveStyle(pageNav);

  pageNav.classList.add(PAGE_NAV_CLONE_CLASS);

  return pageNav;
}

function removePageNavPrint() {
  const tocElements = document.querySelectorAll(`.${PAGE_NAV_CLONE_CLASS}`);
  tocElements.forEach((tocElement) => {
    tocElement.remove();
  });
}

// Insert page navigation into the <page-nav-print> containers.
window.addEventListener('beforeprint', () => {
  const pageNav = document.querySelector(`#${PAGE_NAV_ID}`);
  const pageNavPrintContainers = document.querySelectorAll(`.${PAGE_NAV_PRINT_CONTAINER}`);

  if (pageNav && pageNavPrintContainers.length >= 1) {
    pageNavPrintContainers.forEach((container) => {
      const pageNavClone = clonePageNav(pageNav);
      container.appendChild(pageNavClone);
    });
  }
});

// Remove page navigation clones.
window.addEventListener('afterprint', () => {
  removePageNavPrint();
});

// Check for wrapping in code blocks and adds line numbers if necessary
function checkForWrappingAndAddLineNumbers() {
  document.querySelectorAll('pre > code.hljs').forEach((block) => {
    // Check if any line within the block is wrapped
    const isWrapped = Array.from(block.querySelectorAll('span'))
      .some(line => line.scrollWidth > line.clientWidth);

    if (isWrapped) {
      // Add .line-numbers class to enable line numbering for wrapped lines
      block.classList.add('line-numbers-print');
    }
  });
}

window.addEventListener('beforeprint', () => {
  checkForWrappingAndAddLineNumbers();
});
