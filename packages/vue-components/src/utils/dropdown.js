export default function preventOverflowOnMobile(el) {
  // get highest-level dropdown menu
  let rootDropdownMenu = el;
  while (el = el.parentNode) {
    if (el.classList && el.classList.contains('dropdown-menu')) {
      rootDropdownMenu = el;
    }
  }

  // shift dropdown relative to its parent and prevent overflow if necessary
  if (rootDropdownMenu.offsetWidth > window.innerWidth) {
    rootDropdownMenu.setAttribute('style', 'left: 0px;');
  } else {
    const dropdownPosition = rootDropdownMenu.parentNode.getBoundingClientRect();
    const overflowedWidth = dropdownPosition.left + rootDropdownMenu.offsetWidth - window.innerWidth;
    const leftPosition = overflowedWidth < 0 ? dropdownPosition.left : dropdownPosition.left - overflowedWidth;
    rootDropdownMenu.setAttribute('style', `left: ${leftPosition}px;`);
  }
}
