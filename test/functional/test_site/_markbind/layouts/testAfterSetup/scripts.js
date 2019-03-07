// eslint-disable-next-line no-console
console.log('testAfterLayout script');

function addAlertBoxListener() {
  document.getElementById('alert-box').addEventListener('click', () => {
    // eslint-disable-next-line no-alert
    window.alert('You just clicked the box!');
  });
}

function addMouseoverSpanListener() {
  const whiteOnBlue = 'color: white; background-color: blue;';
  const originalColor = 'color: #24292e; background-color: #f6f8fa;';

  document
    .getElementById('mouseover-span')
    .addEventListener('mouseover', () => {
      const alertBox = document.getElementById('alert-box');
      alertBox.style.cssText =
        alertBox.style.cssText === whiteOnBlue ? originalColor : whiteOnBlue;
    });
}

/* eslint-disable no-undef */
MarkBind.afterSetup(addAlertBoxListener);
MarkBind.afterSetup(addMouseoverSpanListener);
/* eslint-enable no-undef */
