<template>
  <span :class="['image-wrapper', addClass]">
    <div class="image-container">
      <img
        ref="pic"
        :src="src"
        :alt="alt"
        :width="computedWidth"
        class="img-overlay"
        @load.once="computeWidth"
      />
      <canvas
        class="image-canvas"
        ref="annotated-image"
        :src="src"
        :alt="alt"
        :width="computedWidth"
        :style="computedWidth"
        @load.once="computeWidth"
      >
      </canvas>
    </div>
    <span class="annotate-data">
      <slot></slot>
    </span>
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
    addClass: {
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
    computedLoadType() {
      return this.eager ? 'eager' : 'lazy';
    },
  },
  data() {
    return {
      widthFromHeight: '',
    };
  },
  methods: {
    computeWidth() {
      if (!this.hasWidth && this.hasHeight) {
        const renderedImg = this.$refs.pic;
        const imgHeight = renderedImg.naturalHeight;
        const imgWidth = renderedImg.naturalWidth;
        const imageAspectRatio = imgWidth / imgHeight;
        this.widthFromHeight = Math.round(toNumber(this.height) * imageAspectRatio).toString();
      }
    },
    getData() {
      const data = [];
      const annotateNodes = document.querySelectorAll('#annotateData');
      annotateNodes.forEach((node) => {
        data.push({
          x: toNumber(node.getAttribute('x')),
          y: toNumber(node.getAttribute('y')),
          text: String(node.getAttribute('text')),
        });
      });
      return data;
    },
    createCanvas() {
      const canvas = this.$refs['annotated-image'];
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.src = this.src;
      this.canvas = canvas;
      this.ctx = ctx;
      this.image = image;

      let [largestFontWidth, fontOffset, textData, imageWidth, imageHeight, canvasWidth, canvasHeight]
      = this.computeTextData(this.getData());

      image.onload = () => {
        canvasWidth = canvas.width;

        // Image Height/Width
        const { naturalWidth, naturalHeight } = image;
        const imageAspect = naturalWidth / naturalHeight;
        imageWidth = canvasWidth - largestFontWidth - 10;
        imageHeight = imageWidth / imageAspect;

        // Canvas Height/Width
        canvasHeight = Math.max(imageHeight, fontOffset);
        canvas.height = canvasHeight;

        textData.forEach((item) => {
          let tox = 0;
          let toy = 0;

          // Draw out text
          item.textGroup.forEach((textItem) => {
            ctx.font = textItem.font;
            const x = canvasWidth - largestFontWidth;
            const y = textItem.fontOffset + textItem.height;
            ctx.fillText(textItem.txt, x, y);
            tox = x - 10;
            toy = textItem.fontOffset + (textItem.height + 5) / 2;
          });

          // Draw out line
          const fromx = imageWidth * (item.x / 100);
          const fromy = imageHeight * (item.y / 100);

          const headlen = 8; // length of head in pixels
          const dx = fromx - tox;
          const dy = fromy - toy;
          const angle = Math.atan2(dy, dx);

          // Setting up the canvas
          // find largerst x and y coordinates

          ctx.beginPath();

          // Draw the arrow
          ctx.moveTo(tox, toy);
          ctx.lineTo(fromx, fromy);
          ctx.lineTo(fromx - headlen * Math.cos(angle - Math.PI / 6),
                     fromy - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(fromx, fromy);
          ctx.lineTo(fromx - headlen * Math.cos(angle + Math.PI / 6),
                     fromy - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        });

        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
      };
    },
    computeTextData(data) {
      let fontOffset = 0;
      let largestFontWidth = 0;
      const textData = [];

      data.forEach((item) => {
        const parsedText = this.parseInputText(item.text);
        textData.push(
          {
            textGroup: parsedText.map((txt) => {
              const temp = this.parseMarkdown(txt);
              this.ctx.font = temp.font;
              temp.fontOffset = fontOffset;
              fontOffset += temp.height;
              const { actualBoundingBoxLeft, actualBoundingBoxRight } = this.ctx.measureText(txt);
              const width = Math.abs(actualBoundingBoxLeft) + Math.abs(actualBoundingBoxRight);
              temp.width = width;
              largestFontWidth = Math.max(largestFontWidth, width);
              return temp;
            }),
            x: item.x,
            y: item.y,
          });
        fontOffset += 10;
      });

      let imageWidth = 0;
      let imageHeight = 0;
      let canvasWidth = 0;
      let canvasHeight = 0;

      this.image.onload = () => {
        canvasWidth = this.canvas.width;

        // Image Height/Width
        const { naturalWidth, naturalHeight } = this.image;
        const imageAspect = naturalWidth / naturalHeight;
        imageWidth = canvasWidth - largestFontWidth - 10;
        imageHeight = imageWidth / imageAspect;

        // Canvas Height/Width
        canvasHeight = Math.max(imageHeight, fontOffset);
      };

      return {
        fontOffset, largestFontWidth, textData, imageWidth, imageHeight, canvasWidth, canvasHeight,
      };
    },
    parseMarkdown(txt) {
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
    parseInputText(text) {
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
    this.createCanvas();
  },
};
</script>

<style>
    .image-wrapper {
        display: inline-block;
        text-align: center;
        padding: 4px;
    }

    .image-overlay {
        max-width: 100%;
        display: inline-block;
    }

    .image-caption {
        display: block;
    }

    .image-container {
        position: relative;
        width: 100%;
    }

    .image-overlay {
        left: 0;
        top: 0;
        position: absolute;
    }

    .image-canvas{
        max-width: 100%;
        height: auto;
    }
</style>
