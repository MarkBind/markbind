module.exports = {
  bind(el) {
    function onClose() {
      el.dataset.isShown = 'false';
      $showLabel.show();
      $closeButton.hide();
      $content.get()[0].style.display = 'none';
    }

    function onShow() {
      el.dataset.isShown = 'true';
      $showLabel.hide();
      $content.get()[0].style.display = '';
    }

    function onMouseOver() {
      if (el.dataset.isShown === 'false') {
        return;
      }
      $closeButton.show();
    }

    function onMouseOut() {
      if (el.dataset.isShown === 'false') {
        return;
      }
      $closeButton.hide();
    }

    el.dataset.isShown = 'true';
    el.style.position = 'relative';
    const message = el.getAttribute('alt') || 'Expand Content';
    const $content = jQuery(`<div class="content"></div>`);
    jQuery(el).contents().appendTo($content);
    jQuery(el).empty();
    jQuery(el).append($content);
    jQuery(el).attr('class', `${el.className} closeable-wrapper`);
    const $closeButton = jQuery('<span class="closeable-button label label-default hidden-print" style="display: none; position: absolute; top: 0; left: 0; cursor: pointer;background: #d9534f;"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></span>');
    jQuery(el).append($closeButton);
    const $showLabel = jQuery(`<a class="closeable-show hidden-print" style="display: none; cursor: pointer;text-decoration: underline">${message}</a>`);
    jQuery(el).append($showLabel);
    $closeButton.click(onClose);
    $showLabel.click(onShow);
    jQuery(el).on('mouseover', onMouseOver);
    jQuery(el).on('mouseout', onMouseOut);
  }
};
