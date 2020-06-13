module.exports = {
  bind () {
    jQuery(this.el).wrap(function () {
      return `<div></div>`;
    });
  },
  update(direction) {
    this.el.style.float = direction;
    console.log(direction);
  }
};
