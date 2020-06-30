<template>
  <span :class="['card-container', addClass]" ref="cardContainer">
      <div class="morph" v-show="localMinimized">
          <button :class="['morph-display-wrapper', 'btn', btnType, 'card-title']" @click="open()">
              <slot name="_alt">
                  <slot name="_header">
                      <slot name="header"></slot>
                  </slot>
              </slot>
          </button>
      </div>
      <div :class="['card', { 'expandable-card': isExpandableCard }, borderType]" v-show="!localMinimized">
          <div :class="['card-header',{'header-toggle':isExpandableCard}, cardType, borderType]"
               @click.prevent.stop="isExpandableCard && toggle()">
              <div class="caret-wrapper">
                  <span :class="['glyphicon', localExpanded ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right']" v-if="showCaret"></span>
              </div>
              <div class="header-wrapper" ref="headerWrapper">
                  <slot name="header">
                      <div :class="['card-title', cardType, {'text-white':!isLightBg}]">
                          <slot name="_header"></slot>
                      </div>
                  </slot>
              </div>
              <div class="button-wrapper">
                  <slot name="button">
                      <panel-switch v-show="isExpandableCard && !noSwitchBool && !showCaret"
                                    :is-open="localExpanded"
                                    :is-light-bg="isLightBg"></panel-switch>
                      <button type="button"
                              class="close-button btn"
                              :class="[isLightBg ? 'btn-outline-secondary' : 'btn-outline-light', { 'seamless-button': isSeamless }]"
                              v-show="!noCloseBool"
                              @click.stop="close()">
                          <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
                      </button>
                      <button type="button"
                              class="popup-button btn"
                              :class="[isLightBg ? 'btn-outline-secondary' : 'btn-outline-light', { 'seamless-button': isSeamless }]"
                              v-show="this.popupUrl"
                              @click.stop="openPopup()">
                          <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>
                      </button>
                  </slot>
              </div>
          </div>
          <transition @before-enter="beforeExpand"
                      @enter="duringExpand"
                      @after-enter="afterExpand"
                      @before-leave="beforeCollapse"
                      @leave="duringCollapse"
                      v-if="preloadBool || wasRetrieverLoaded"
          >
              <div class="card-collapse"
                   ref="panel"
                   v-show="localExpanded"
              >
                  <div class="card-body">
                      <slot></slot>
                      <retriever v-if="hasSrc"
                                 ref="retriever"
                                 :src="src"
                                 :fragment="fragment"
                                 @src-loaded="setMaxHeight" />
                      <panel-switch v-show="isExpandableCard && bottomSwitchBool" :is-open="localExpanded"
                                    @click.native.stop.prevent="toggle()" />
                  </div>
                  <hr v-show="isSeamless" />
              </div>
          </transition>
      </div>
  </span>
</template>

<script>
import panelBase from './PanelBase';
import panelSwitch from './PanelSwitch.vue';
import retriever from '../Retriever.vue';

export default {
  mixins: [panelBase],
  components: {
    panelSwitch,
    retriever,
  },
  computed: {
    showCaret() {
      return this.isSeamless && this.expandableBool;
    },
    isSeamless() {
      return this.type === 'seamless';
    },
    btnType() {
      if (this.isSeamless || this.type === 'light') {
        return 'btn-outline-secondary';
      }
      return `btn-outline-${this.type || 'secondary'}`;
    },
    borderType() {
      if (this.isSeamless) {
        return 'border-0';
      } else if (this.type) {
        if (this.type === 'light') {
          return ''; // Bootstrap 4.x light border is almost invisible on a white page
        }
        return `border-${this.type}`;
      }
      return '';
    },
    cardType() {
      if (this.isSeamless) {
        return 'bg-white';
      }
      return `bg-${this.type || 'light'}`;
    },
    isLightBg() {
      return this.cardType === 'bg-light' || this.cardType === 'bg-white' || this.cardType === 'bg-warning';
    },
  },
};
</script>

<style scoped>
    .card-collapse {
        overflow: hidden;
        transition: max-height 0.5s ease-in-out;
    }
    
    .seamless-button {
        opacity: 0;
        transition: 0.3s opacity;
    }
    
    .card-header:hover .seamless-button {
        opacity: 1;
    }
</style>

<style>
    .card-heading {
        width: 100%;
    }

    .card-title {
        display: inline-block;
        font-size: 1em;
        margin: 0;
        vertical-align: middle;
    }

    .card-title * {
        margin: 0px !important;
    }

    .caret-wrapper {
        float: left;
        display: inline-block;
        width: 32px;
    }

    .header-wrapper {
        display: inline-block;
        width: calc(100% - 32px - 96px);
    }

    .button-wrapper {
        float: right;
        display: inline-block;
        width: 96px;
    }

    .header-toggle {
        cursor: pointer;
    }

    .expandable-card {
        margin-bottom: 0 !important;
        margin-top: 5px;
    }

    .card-group > .card-container > .expandable-card {
        margin-top: 0!important;
    }

    .card-seamless {
        padding: 0;
    }

    .card.card-seamless {
        box-shadow: none;
        border: none;
    }

    .card-seamless > .card-heading {
        padding: 0;
    }

    .card-seamless > .card-collapse > hr {
        margin: 0;
        width: calc(100% - 27px);
    }

    .card-seamless > .card-collapse > .card-body {
        padding: 10px 0;
    }

    .card-seamless > .card-collapse > .card-body > .collapse-button {
        position: relative;
        top: 22px;
    }

    .card-body > .collapse-button {
        margin-bottom: 13px;
        margin-top: 5px;
        opacity: 0.2;
    }

    .card-body > .collapse-button:hover {
        opacity: 1;
    }

    .close-button {
        font-size: 10px !important;
        float: right;
        padding: 3px 8px !important;
        margin-left: 3px;
        margin-top: 2px;
    }

    .popup-button {
        font-size: 10px !important;
        float: right;
        margin-top: 2px;
        padding: 3px 8px !important;
    }

    .morph {
        display: inline-block;
    }

    .morph-display-wrapper {
        white-space: normal;
    }

    /* Bootstrap extra small(xs) responsive breakpoint */
    @media (max-width: 575.98px) {

        .caret-wrapper {
            float: left;
            display: inline-block;
            width: 32px;
        }

        .header-wrapper {
            display: inline-block;
            width: calc(100% - 32px - 32px);
        }

        .button-wrapper {
            float: right;
            display: inline-block;
            width: 32px;
        }

        .card-body {
            padding: 0.5rem;
        }

        .card-collapse > hr {
            margin-top: 1.5rem;
        }

        .card-header {
            padding: 0.5rem;
        }
    }
</style>
