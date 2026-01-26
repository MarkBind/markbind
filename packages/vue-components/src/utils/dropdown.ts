export default function preventOverflowOnMobile(el: HTMLElement): void {
  // get highest-level dropdown menu
  let rootDropdownMenu: HTMLElement = el;
  let currentEl: HTMLElement | null = el;
  while (currentEl) {
    if (currentEl.classList && currentEl.classList.contains('dropdown-menu')) {
      rootDropdownMenu = currentEl;
    }
    currentEl = currentEl.parentNode as HTMLElement | null;
  }

  // shift dropdown relative to its parent and prevent overflow if necessary
  if (rootDropdownMenu.offsetWidth > window.innerWidth) {
    rootDropdownMenu.setAttribute('style', 'left: 0px;');
  } else {
    const dropdownPosition = (rootDropdownMenu.parentNode as HTMLElement).getBoundingClientRect();
    const overflowedWidth = dropdownPosition.left + rootDropdownMenu.offsetWidth - window.innerWidth;
    const leftPosition = overflowedWidth < 0
      ? dropdownPosition.left
      : dropdownPosition.left - overflowedWidth;
    rootDropdownMenu.setAttribute('style', `left: ${leftPosition}px;`);
  }
}
