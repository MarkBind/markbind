<template>
  <span ref="cardContainer" :class="['card-container', addClass]">
    <div v-show="localMinimized" class="morph">
      <button class="morph-display-wrapper btn card-title morph-title" @click="minimalOpen()">
        <slot name="_alt">
          <slot name="header"></slot>
        </slot>
      </button>
    </div>
    <div v-show="!localMinimized" class="card card-flex">
      <div
        :class="['header-wrapper',
                 { 'header-wrapper-bottom': isHeaderAtBottom, 'header-toggle': isExpandableCard }]"
        @click.prevent.stop="isExpandableCard && minimalToggle()"
      >
        <transition name="header-fade">
          <span
            v-show="!isHeaderAtBottom"
            ref="headerWrapper"
            :class="['card-title', 'card-title-transparent', { 'ellipses': !hasHeaderBool }]"
          >
            <span class="card-title-inline"><slot name="header"></slot></span>
            <span
              v-show="showDownSwitch"
              aria-hidden="true"
              class="minimal-button glyphicon glyphicon-menu-down minimal-menu-down"
            ></span>
          </span>
        </transition>
        <div :class="['button-wrapper', { 'button-wrapper-expanded': isHeaderAtBottom }]">
          <slot name="button">
            <button
              v-show="!noCloseBool"
              class="minimal-button"
              type="button"
              @click.stop="minimalClose()"
            >
              <span class="glyphicon glyphicon-remove minimal-close-button" aria-hidden="true"></span>
            </button>
            <button
              v-show="popupUrl !== null"
              class="minimal-button"
              type="button"
              @click.stop="openPopup()"
            >
              <span class="glyphicon glyphicon-new-window minimal-popup-button" aria-hidden="true"></span>
            </button>
            <button
              v-show="isHeaderAtBottom && isExpandableCard && bottomSwitchBool"
              class="minimal-button"
              type="button"
            >
              <span class="glyphicon glyphicon-menu-up minimal-menu-up" aria-hidden="true"></span>
            </button>
          </slot>
        </div>
      </div>
      <div
        ref="panel"
        class="card-collapse"
      >
        <div class="card-body">
          <slot></slot>
          <retriever
            v-if="hasSrc"
            ref="retriever"
            :src="src"
            :fragment="fragment"
          />
        </div>
      </div>
    </div>
  </span>
</template>

<script>
import retriever from '../Retriever.vue';
import panelBase from './PanelBase';

export default {
  mixins: [panelBase],
  components: {
    retriever,
  },
  data() {
    return {
      /*
      'Copy' of localExpanded that is updated on certain animation events.
      It is minimal-panel specific due to its design (the header can shift to the bottom).
      Its purpose is to show the header text only once the collapse animation has finished.
       */
      isHeaderAtBottom: false,
    };
  },
  computed: {
    showDownSwitch() {
      return this.hasHeaderBool && this.isExpandableCard && !this.noSwitchBool;
    },
  },
  methods: {
    minimalToggle() {
      if (this.localExpanded) {
        // this is a collapse, set isHeaderAtBottom to true only at the end of transition
        // to achieve the correct collapse transition effect of minimal panel
        const onCollapseDone = () => {
          this.isHeaderAtBottom = !this.isHeaderAtBottom;
          this.$refs.panel.removeEventListener('transitionend', onCollapseDone);
        };
        this.$refs.panel.addEventListener('transitionend', onCollapseDone);
      } else {
        // this is an expansion, immediately set isHeaderAtBottom to true
        this.isHeaderAtBottom = !this.isHeaderAtBottom;
      }
      this.toggle();
    },
    minimalOpen() {
      this.open();
      this.isHeaderAtBottom = true;
    },
    minimalClose() {
      this.close();
      this.isHeaderAtBottom = false;
    },
  },
  mounted() {
    this.isHeaderAtBottom = this.localExpanded;
  },
};
</script>

<style scoped>
  .morph-title {
    padding: 0 0.3em;
    color: rgba(0, 0, 0, 0.5);
    border-color: rgba(0, 0, 0, 0.5);
    background-color: transparent;
    vertical-align: top;
  }

  .morph-title:hover, .morph-title:active, .morph-title:focus {
    color: black;
    border-color: black;
    background-color: rgba(244, 244, 244, 0.3);
  }

  .card-collapse {
    overflow: hidden;
    transition: max-height 0.5s ease-in-out;
  }

  .card-flex {
    display: flex;
    flex-direction: column;
    border: 0;
    margin: 0;
  }

  .card-title-transparent {
    opacity: 0.5;
    transition: opacity 0.5s;
  }

  .card:hover .card-title-transparent {
    opacity: 1;
  }

  .header-fade-enter {
    opacity: 0;
  }

  .header-fade-leave-active {
    position: absolute;
  }

  .header-fade-leave-to {
    opacity: 0 !important;
  }

  .card-title-inline {
    display: inline-block;
  }

  .card-body {
    padding: 0;
  }

  .header-wrapper {
    width: 100%;
    display: inline-block;
    background-color: white;
  }

  .header-wrapper-bottom {
    order: 1;
  }

  .ellipses::before {
    position: relative;
    bottom: 3px;
    content: '...';
    font-weight: 900;
    margin-right: 4px;
  }

  .button-wrapper {
    padding-left: 2px;
    border-width: 0 0 0 1px;
    border-color: rgba(150, 150, 150, 0.2);
    border-style: solid;
    margin-left: 2px;
    width: auto;
    float: none;
    opacity: 0;
    transition: opacity 0.5s;
    vertical-align: text-top;
  }

  .button-wrapper-expanded {
    padding-left: 0;
    border: 0;
    margin-left: 0;
  }

  .card:hover .button-wrapper {
    opacity: 1;
  }

  .header-toggle {
    cursor: pointer;
  }

  .minimal-button {
    padding: 0 3px;
    border: 0;
    color: rgb(150, 150, 150);
    background-color: transparent;
    cursor: pointer;
  }

  .minimal-button:hover, .minimal-button:active, .minimal-button:focus {
    color: rgb(30, 30, 30);
  }

  .minimal-popup-button {
    top: 1px;
    font-size: 9px;
  }

  .minimal-menu-up {
    top: 3px;
    font-size: 13px;
  }

  .minimal-menu-down {
    top: 1px;
    font-size: 13px;
  }

  .minimal-close-button {
    top: 2px;
    font-size: 11px;
  }

  /* Bootstrap extra small(xs) responsive breakpoint */
  @media (max-width: 575.98px) {
    .button-wrapper-expanded {
      padding-left: 0;
      border: 0;
      margin-left: 0;
      opacity: 0.15;
    }

    .button-wrapper-visible {
      opacity: 1;
    }
  }
</style>
