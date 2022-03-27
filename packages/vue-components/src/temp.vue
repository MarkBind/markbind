<template>
  <div class="image-container">
    <canvas
      ref="annotated-image"
      :width="imageWidth"
    >
    </canvas>
    <div class="button">
      <button @click="canvas_arrow(0, 0, 500, 20)">draw line</button>
    </div>
    <div class="button">
      <button @click="canvas_text('#A test text \n abs')">draw text</button>
    </div>
  </div>
</template>

<script>
import { toNumber } from './utils/utils';

export default {
  props: {
    text: {
      type: String,
      default: '',
    },
    x: {
      type: String,
      default: '',
    },
    y: {
      type: String,
      default: '',
    },
  },
  computed: {
  },
  inject: ['width', 'height', 'src'],
  data() {
    return {
      imageWidth: this.width,
      imageHeight: this.height,
      src: this.src,
    };
  },
  methods: {
    create_canvas() {
      const canvas = this.$refs['annotated-image'];
      const ctx = canvas.getContext('2d');

      let canvasWidth = toNumber(this.imageWidth);
      let canvasHeight = toNumber(this.imageHeight);

      console.log(canvasHeight, canvasWidth);
      console.log('that was height');


      const aspect = canvasWidth / canvasHeight;

      let fontOffset = 0;
      let fontHeight = 0;
      let largestFontWidth = 0;

      const parsedText = this.parse_input_text('#A test text \n abs');

      const items = parsedText.map((txt) => {
        const item = this.parse_markdown(txt);
        ctx.font = item.font;
        item.fontOffset = fontOffset;
        fontOffset += item.height;
        fontHeight += item.height;
        const { actualBoundingBoxLeft, actualBoundingBoxRight } = ctx.measureText(txt);
        const width = Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight);
        item.width = width;
        largestFontWidth = Math.max(largestFontWidth, width);
        return item;
      });

      canvasWidth = canvasWidth + largestFontWidth + 10;
      canvasHeight = canvasWidth / aspect;

      canvas.width = canvasWidth;
      // canvas.height = canvasHeight;

      items.forEach((item) => {
        ctx.font = item.font;
        const x = canvasWidth - largestFontWidth;
        const y = item.fontOffset + item.height;
        ctx.fillText(item.txt, x, y);
      });

      const tox = canvasWidth - largestFontWidth;
      const fromx = canvasWidth * (Number(this.x) / 100);
      const toy = fontHeight / 2;
      const fromy = canvasHeight * (Number(this.y) / 100);

      const headlen = 10; // length of head in pixels
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);

      // Setting up the canvas
      // find largerst x and y coordinates

      ctx.beginPath();

      // Draw the arrow
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6),
                 toy - headlen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6),
                 toy - headlen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    },
    parse_markdown(txt) {
      const lineHeight = 1;
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
    document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        console.log('Page completed with image and files!');
        // fetch to next page or some code
        this.create_canvas();
      }
    };
  },
};
</script>

<style>
    .image-container {
        text-align: center;
        position: relative;
    }

    .image-overlay {
        left: 0;
        top: 0;
        position: absolute;
    }
</style>
