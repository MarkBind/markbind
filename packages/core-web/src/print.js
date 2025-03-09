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
  console.log(activeElements.length ? `Removed active style from ${activeElements.length} elements.`
    : 'Did not find any active elements.');
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
  return tocElements.length > 0;
}

// Insert page navigation into the <page-nav-print> containers.
window.addEventListener('beforeprint', () => {
  const pageNav = document.querySelector(`#${PAGE_NAV_ID}`);
  const pageNavPrintContainers = document.querySelectorAll(`.${PAGE_NAV_PRINT_CONTAINER}`);

  if (pageNav && pageNavPrintContainers.length >= 1) {
    // console.log(
    //   removePageNavPrint() ? 'Removed clones in beforeprint'
    //     : 'Did not remove clones in beforeprint'); // remove any existing clones
    pageNavPrintContainers.forEach((container) => {
      const pageNavClone = clonePageNav(pageNav);
      const pageNavClone2 = clonePageNav(pageNav);
      container.appendChild(pageNavClone);
      container.appendChild(pageNavClone2);
      console.log('hi');
      console.log(container);
    });
  }
});

// Remove page navigation clones.
window.addEventListener('afterprint', () => {
  // console.log(
  //   removePageNavPrint() ? 'Removed clones in beforeprint'
  //     : 'Did not remove clones in beforeprint');
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

// Append "preload" attribute to all the panels

// Test: remove "preload" attribute from all the panels
function removePreload() {
  document.querySelectorAll('card-container').forEach((block) => {
    block.attributes.removeNamedItem('preload');
  });
}

window.addEventListener('beforeinput', () => {
  removePreload();
});
