<template>
  <span :class="['image-wrapper', addClass]">
    <div class="image-container">
      <!-- <canvas
        ref="annotated-drawing"
        class="image-overlay"
        :src="src"
        :alt="alt"
      >
      </canvas> -->
      <canvas
        ref="annotated-image"
        :src="src"
        :alt="alt"
        :width="computedWidth"
        @load.once="computeWidth"
      >
      </canvas>
    </div>
    <span class="image-caption">
      <slot></slot>
    </span>
    <div class="button">
      <button @click="canvas_arrow(0, 0, 500, 20)">draw line</button>
    </div>
    <div class="button">
      <button @click="canvas_arrow(0, 0, 200, 500)">draw line2</button>
    </div>
    <div class="button">
      <button @click="canvas_text('#A test text \n abs')">draw text</button>
    </div>
  </span>
</template>

<script>
import { toNumber } from './utils/utils';

export default {
  props: {
    src: {
      type: String,
      default: null,
    },
    alt: {
      type: String,
      default: null,
    },
    height: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '',
    },
  },
  computed: {
    hasWidth() {
      return this.width !== '';
    },
    hasHeight() {
      return this.height !== '';
    },
    computedWidth() {
      if (this.hasWidth) {
        return this.width;
      }
      return this.widthFromHeight;
    },
  },
  data() {
    return {
      widthFromHeight: '',
      provider: {
        context: null,
      },
    };
  },
  methods: {
    computeWidth() {
      if (!this.hasWidth && this.hasHeight) {
        const renderedImg = this.$refs.pic;
        const imgHeight = renderedImg.naturalHeight;
        const imgWidth = renderedImg.naturalWidth;
        const aspectRatio = imgWidth / imgHeight;
        this.widthFromHeight = Math.round(toNumber(this.height) * aspectRatio).toString();
      }
    },
    create_canvas(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.draw_image(this.src);
    },
    draw_image(src) {
      const image = new Image();
      image.src = src;
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const w = this.canvas.width;
        const nw = image.naturalWidth;
        const nh = image.naturalHeight;
        const aspect = nw / nh;
        const h = w / aspect;
        this.canvas.height = h;
        this.ctx.drawImage(image, 0, 0, w, h);
        this.imageHeight = h;
        this.imageWidth = w;
      };
    },
    resize_image(src, w, h) {
      const image = new Image();
      image.src = src;
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx.drawImage(image, 0, 0, this.imageWidth, this.imageHeight);
      };
    },
    canvas_arrow(fromx, fromy, tox, toy) {
      // Calculate the arrow
      const headlen = 10; // length of head in pixels
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);
      // Setting up the canvas
      // find largerst x and y coordinates
      const maxX = Math.max(fromx, tox, this.width);
      const maxY = Math.max(fromy, toy, this.height);

      const oldCanvas = this.canvas.toDataURL('image/png');
      this.resize_image(oldCanvas, maxX, maxY);
      this.ctx.beginPath();

      // Draw the arrow
      this.ctx.moveTo(fromx, fromy);
      this.ctx.lineTo(tox, toy);
      this.ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6),
                      toy - headlen * Math.sin(angle - Math.PI / 6));
      this.ctx.moveTo(tox, toy);
      this.ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6),
                      toy - headlen * Math.sin(angle + Math.PI / 6));
      this.ctx.stroke();
    },
    canvas_text(text) {
      // this.ctx.font = this.getFont();

      let offset = 0;
      let totalHeight = 0;
      let largestWidth = 0;

      const parsedText = this.parse_input_text(text);

      const items = parsedText.map((txt) => {
        const item = this.parse_markdown(txt);
        item.offset = offset;
        offset += item.height;
        totalHeight += item.height;
        const { actualBoundingBoxLeft, actualBoundingBoxRight } = this.ctx.measureText(txt);
        const width = Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight);
        item.width = (width / 100) * this.canvas.width;
        largestWidth = Math.max(largestWidth, item.width);
        return item;
      });

      const maxY = Math.max(totalHeight, this.canvas.height);
      this.resize_image(largestWidth + this.canvas.width, maxY);

      items.forEach((item) => {
        this.ctx.font = item.font;
        const x = this.canvas.width - largestWidth;
        const y = item.offset + item.height;
        this.ctx.fillText(item.txt, x, y);
      });
    },
    getFont() {
      // For dynamic rendering of font size
      const fontBase = 1000;
      const fontSize = 40;
      const fontRatio = fontSize / fontBase;
      const fontSizePx = fontRatio * this.canvas.width;
      return `${fontSizePx}px Arial`;
    },
    parse_markdown(txt) {
      const lineHeight = 1.5;
      const headingSize = 32;
      const baseSize = 16;

      if (txt.trim().startsWith('#')) {
        // eslint-disable-next-line no-useless-escape
        const level = txt.match(/\s*\#/g).length;
        const size = headingSize - (level * 4);
        return {
          font: `bold ${size}px roboto`,
          height: size * lineHeight,
          txt,
        };
      }
      return {
        font: `${baseSize}px roboto`,
        height: baseSize * lineHeight,
        txt,
      };
    },
    parse_input_text(text) {
      const lines = text.split('\n');
      return lines;
    },
  },
  provide() {
    return {
      provider: this.provider,
    };
  },
  mounted() {
    const canvas = this.$refs['annotated-image'];
    // const canvas2 = this.$refs['annotated-drawing'];
    this.create_canvas(canvas);
  },
};
</script>

<style>
    .image-wrapper {
        display: inline-block;
        text-align: center;
        padding: 4px;
    }

    .image-caption {
        display: block;
    }

    .image-container {
        position: relative;
    }

    .image-overlay {
        position: absolute;
    }
</style>
