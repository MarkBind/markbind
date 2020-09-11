function lightenScrollTopButton(scrollTopButton, timers) {
  // lightens the scroll-top-button after 1 second of button inactivity
  // prevents the button from obscuring the content
  timers.lightenButtonTimer = setTimeout(() => {
    if (!scrollTopButton.classList.contains('lighten')) {
      scrollTopButton.classList.add('lighten');
    }
  }, 1000);
}

function showOrHideScrollTopButton(scrollTopButton, timers) {
  timers.showOrHideButtonTimer = setTimeout(() => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      scrollTopButton.style.display = 'block';
      lightenScrollTopButton(scrollTopButton, timers);
    } else {
      scrollTopButton.style.display = 'none';
    }
  }, 100);
}

function resetScrollTopButton(scrollTopButton, timers) {
  clearTimeout(timers.displayButtonTimer);
  clearTimeout(timers.lightenButtonTimer);
  scrollTopButton.classList.remove('lighten');
}

function promptScrollTopButton(timers) {
  const scrollTopButton = document.querySelector('#scroll-top-button');
  resetScrollTopButton(scrollTopButton, timers);
  showOrHideScrollTopButton(scrollTopButton, timers);
}

function initScrollTopButton() {
  const timers = {
    showOrHideButtonTimer: 0,
    lightenButtonTimer: 0,
  };
  window.addEventListener('scroll', () => {
    promptScrollTopButton(timers);
  });
}

window.handleScrollTop = function () {
  document.body.scrollIntoView({ block: 'start', behavior: 'smooth' });
};

export default initScrollTopButton;
