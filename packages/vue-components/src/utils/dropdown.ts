export default function preventOverflowOnMobile(el: HTMLElement): void {
  // get highest-level dropdown menu
  let rootDropdownMenu: HTMLElement = el;
  let currentEl: Node | null = el;
  while (currentEl) {
    if (currentEl instanceof HTMLElement
        && currentEl.classList.contains('dropdown-menu')) {
      rootDropdownMenu = currentEl;
    }
    currentEl = currentEl.parentNode;
  }

  // shift dropdown relative to its parent and prevent overflow if necessary
  if (rootDropdownMenu.offsetWidth > window.innerWidth) {
    rootDropdownMenu.setAttribute('style', 'left: 0px;');
  } else {
    const parentNode = rootDropdownMenu.parentNode as HTMLElement | null;
    if (!parentNode) {
      return;
    }
    const dropdownPosition = parentNode.getBoundingClientRect();
    const overflowedWidth = dropdownPosition.left + rootDropdownMenu.offsetWidth - window.innerWidth;
    const leftPosition = overflowedWidth < 0
      ? dropdownPosition.left
      : dropdownPosition.left - overflowedWidth;
    rootDropdownMenu.setAttribute('style', `left: ${leftPosition}px;`);
  }
}
