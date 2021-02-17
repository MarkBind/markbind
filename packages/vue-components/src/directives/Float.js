module.exports = {
  bind() {
    // eslint-disable-next-line lodash/prefer-constant
    jQuery(this.el).wrap(() => '<div></div>');
  },
  update(direction) {
    this.el.style.float = direction;
    console.log(direction);
  },
};
