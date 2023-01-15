const PAGE_NAV_ID = 'mb-page-nav';
const PAGE_NAV_PRINT_CLASS = 'print-page-nav';
const PAGE_NAV_PRINT_CONTAINER_CLASS = 'toc';

function removeToc() {
  const tocElements = document.querySelectorAll(`.${PAGE_NAV_PRINT_CLASS}`);
  tocElements.forEach((tocElement) => {
    tocElement.remove();
  });
}

function removeActiveStyle(container) {
  const activeElements = container.querySelectorAll('a.active');
  activeElements.forEach((activeElement) => {
    activeElement.classList.remove('active');
  });
}

function clonePageNav(node) {
  const pageNav = node.cloneNode(true);
  pageNav.removeAttribute('id'); // avoid duplicate id
  pageNav.classList.add(PAGE_NAV_PRINT_CLASS);
  removeActiveStyle(pageNav); // prevent accidental item highlighting
  return pageNav;
}

window.addEventListener('beforeprint', () => {
  const pageNav = document.querySelector(`#${PAGE_NAV_ID}`);
  const tocContainers = document.querySelectorAll(`.${PAGE_NAV_PRINT_CONTAINER_CLASS}`);
  if (pageNav && tocContainers.length >= 1) {
    removeToc();
    tocContainers.forEach((tocContainer) => {
      tocContainer.appendChild(clonePageNav(pageNav));
    });
  }
});

window.addEventListener('afterprint', () => {
  removeToc();
});
