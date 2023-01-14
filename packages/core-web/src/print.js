function removeToc() {
  const tocElements = document.querySelectorAll('.print-toc');
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

window.addEventListener('beforeprint', () => {
  const pageNav = document.querySelector('#mb-page-nav');
  const tocContainers = document.querySelectorAll('.toc');
  if (pageNav && tocContainers.length >= 1) {
    removeToc();
    const toc = pageNav.cloneNode(true);
    toc.removeAttribute('id'); // avoid duplicate id
    toc.classList.add('print-toc');
    removeActiveStyle(toc); // prevent accidental highlighting
    tocContainers.forEach((tocContainer) => {
      tocContainer.appendChild(toc);
    });
  }
});

window.addEventListener('afterprint', () => {
  removeToc();
});
