/* Logic adapted from:
 * ========================================================================
 * Bootstrap: dropdownhover.js v1.1.x
 * http://kybarg.github.io/bootstrap-dropdown-hover/
 * ========================================================================
 * Licensed under MIT (https://github.com/kybarg/bootstrap-dropdown-hover/blob/master/LICENSE)
 * ======================================================================== */

function isRightAlign(el) {
  const viewport = {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  };

  const position = el.getBoundingClientRect();

  if (position === undefined) {
    return true;
  }

  const bounds = {
    top: position.y,
    left: position.x,
    right: position.x + el.offsetWidth,
    bottom: position.y + el.offsetHeight,
  };

  if (bounds.left < 0) {
    return false;
  }

  if (bounds.left < viewport.left) {
    return true;
  } else if (bounds.right > viewport.right) {
    return false;
  }

  return true;
}

function preventOverflow(el) {
  el.removeAttribute('style');

  const viewport = {
    top: 0,
    left: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
  };

  const position = el.getBoundingClientRect();

  if (position === undefined) {
    return;
  }

  const bounds = {
    top: position.y,
    left: position.x,
    right: position.x + el.offsetWidth,
    bottom: position.y + el.offsetHeight,
  };

  if (bounds.bottom > viewport.bottom) {
    el.setAttribute('style', `bottom: auto; top: ${-(bounds.bottom - viewport.bottom)}px;`);
  } else if (bounds.top < viewport.top) {
    el.setAttribute('style', `top: auto; bottom: ${-(viewport.top - bounds.top)}px;`);
  }
}

export default { isRightAlign, preventOverflow };
