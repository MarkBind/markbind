/* eslint no-undef: "error" */
/* eslint-env browser */

// Add event listener for site-nav-btn to toggle itself and site navigation elements.
const siteNavBtn = document.getElementById('site-nav-btn');
if (siteNavBtn) {
  siteNavBtn.addEventListener('click', function () {
    this.classList.toggle('shift');
    document.getElementById('site-nav').classList.toggle('open');
    document.getElementById('site-nav-btn-wrap').classList.toggle('open');
  });
}

// Creates event listener for all dropdown-btns in page.
Array.prototype.forEach.call(
  document.getElementsByClassName('dropdown-btn'),
  dropdownBtn => dropdownBtn.addEventListener('click', function () {
    this.classList.toggle('dropdown-btn-open');
    const dropdownContent = this.nextElementSibling;
    const dropdownIcon = this.lastElementChild;
    dropdownContent.classList.toggle('dropdown-container-open');
    dropdownIcon.classList.toggle('rotate-icon');
  }),
);
