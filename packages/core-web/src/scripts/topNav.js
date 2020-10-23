/**
 * This script highlights the currently loaded page in the top navigation bar.
 */
function hasMatchingUrl(elements, currPage) {
  if (!elements || !elements.children) {
    return false;
  }
  // Only check <a> leaf nodes
  if (elements.children.length === 0) {
    if (elements.href) {
      const page = elements.href.substring(elements.href.lastIndexOf('/') + 1);
      if (page === currPage) {
        return true;
      }
    }
    return false;
  }
  // otherwise, check all children recursively
  return Array.from(elements.children).some(node => hasMatchingUrl(node, currPage));
}

function addTopNavListener() {
  document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.navbar .navbar-nav .nav-link');
    if (!navLinks) {
      return;
    }
    const currPage = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    Array.from(navLinks).forEach((node) => {
      const matched = hasMatchingUrl(node, currPage);
      if (matched) {
        node.classList.add('current');
      }
    });
  });
}

export default addTopNavListener;
