<template>
  <span
    v-if="localMinimized"
    ref="cardContainer"
    :class="['card-container', addClass]"
  >
    <span
      v-if="hasId"
      :id="panelId"
      class="anchor"
    ></span>
    <span class="morph">
      <button :class="['morph-display-wrapper', 'btn', btnType]" @click="open()">
        <div
          v-if="!noMinimizedSwitch"
          class="minimal-caret-wrapper"
        >
          <span
            :class="['glyphicon', 'glyphicon-chevron-right']"
          ></span>
        </div>
        <span class="card-title">
          <slot name="_alt">
            <slot name="header"></slot>
          </slot>
        </span>
      </button>
    </span>
  </span>
  <div
    v-else
    ref="cardContainer"
    :class="['card-container', addClass]"
  >
    <span
      v-if="hasId"
      :id="panelId"
      class="anchor"
    ></span>
    <div :class="['card', { 'expandable-card': isExpandableCard, 'card-seamless' : isSeamless }, borderType]">
      <div
        :class="['card-header', {'header-toggle':isExpandableCard,'card-header-seamless' : isSeamless},
        cardType, borderType]"
        @click.prevent.stop="isExpandableCard && toggle()"
      >
        <div class="caret-wrapper">
          <span
            v-if="showCaret"
            :class="['glyphicon', localExpanded ? 'glyphicon-chevron-down' : 'glyphicon-chevron-right']"
          ></span>
        </div>
        <div
          ref="headerWrapper"
          :class="[{'header-wrapper-seamless': isSeamless}, 'header-wrapper card-title', cardType,
                   {'text-white':!isLightBg, 'header-transparent':!shouldShowHeader}]"
        >
          <slot name="header"></slot>
        </div>
        <div class="button-wrapper">
          <slot name="button">
            <panel-switch
              v-show="isExpandableCard && !noSwitchBool && !showCaret"
              :is-open="localExpanded"
              :is-light-bg="isLightBg"
            />
            <button
              v-show="!noCloseBool"
              type="button"
              class="close-button btn"
              :class="[isLightBg ? 'btn-outline-secondary' : 'btn-outline-light',
                       { 'seamless-button': isSeamless }]"
              @click.stop="close()"
            >
              <span class="glyphicon glyphicon-remove" aria-hidden="true"></span>
            </button>
            <button
              v-show="popupUrl"
              type="button"
              class="popup-button btn"
              :class="[isLightBg ? 'btn-outline-secondary' : 'btn-outline-light',
                       { 'seamless-button': isSeamless }]"
              @click.stop="openPopup()"
            >
              <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>
            </button>
          </slot>
        </div>
      </div>
      <div
        ref="panel"
        class="card-collapse"
        :class="{'card-peek-collapsed': shouldShowPeek}"
      >
        <div
          v-if="wasRetrieverLoaded || preloadBool"
          class="card-body"
        >
          <slot></slot>
          <retriever
            v-if="hasSrc"
            ref="retriever"
            :src="srcWithoutFragment"
            :fragment="fragment"
            @src-loaded="retrieverUpdateMaxHeight"
          />
          <panel-switch
            v-show="isExpandableCard && bottomSwitchBool"
            :is-open="localExpanded"
            @click.native.stop.prevent="toggle()"
          />
        </div>
        <hr v-show="isSeamless" />
      </div>
      <transition name="peek-read-more-fade">
        <div
          v-if="shouldShowPeek"
          class="peek-read-more glyphicon glyphicon-chevron-down"
          @click="toggle()"
        >
        </div>
      </transition>
    </div>
  </div>
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

    .card-peek-collapsed {
        position: relative;
    }

    /*
     * Gives the faded content effect for peek.
     * Ensure that height has the same value as collapsedPanelHeight in PanelBase.js.
     */
    .card-peek-collapsed::after {
        content: "";
        position: absolute;
        width: 100%;
        bottom: 0;
        height: 125px;
        background-image: linear-gradient(180deg, transparent, white 90%);
    }

    .peek-read-more {
        z-index: 1;
        opacity: 0.2;
        transition: opacity 0.5s;
    }

    /* Targets the before pseudoelement of glyphicon-chevron-down. */
    .peek-read-more::before {
        position: absolute;
        width: 100%;
        text-align: center;
        bottom: 10px;
    }

    .peek-read-more:hover {
        cursor: pointer;
        opacity: 0.4;
    }

    .peek-read-more-fade-enter,
    .peek-read-more-fade-leave-to {
        opacity: 0;
    }

</style>

<style>
    .card-seamless,
    .card-header-seamless {
        background-color: inherit !important;
    }

    .card-heading {
        width: 100%;
    }

    .card-title {
        display: inline-block;
        font-size: 1em;
        line-height: 1.2em;
        margin: 0;
        white-space: normal;
        text-align: left;
    }

    .card-title * {
        margin-bottom: 0 !important;
    }

    .caret-wrapper {
        float: left;
        width: 32px;
    }

    .minimal-caret-wrapper {
        display: inline-block;
        font-size: 13px;
        margin-right: 5px;
    }

    .header-wrapper {
        display: inline-block;
        width: calc(100% - 32px - 96px);
        transition: 0.5s opacity;
    }

    .header-wrapper-seamless {
        background-color: inherit !important;
    }

    .header-transparent {
        opacity: 0;
    }

    .button-wrapper {
        float: right;
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
        margin-top: 0 !important;
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

    .card-body > .collapse-button {
        margin-bottom: 13px;
        margin-top: 5px;
        opacity: 0.2;
    }

    .card-body > .collapse-button:hover {
        opacity: 1;
    }

    .card-seamless > .card-collapse > .card-body > .collapse-button {
        position: relative;
        top: 22px;
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
        margin-top: 5px;
        display: flex;
        align-items: center;
    }

    /* Bootstrap extra small(xs) responsive breakpoint */
    @media (max-width: 575.98px) {
        .header-wrapper {
            display: inline-block;
            width: calc(100% - 32px - 32px);
        }

        .button-wrapper {
            float: right;
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
