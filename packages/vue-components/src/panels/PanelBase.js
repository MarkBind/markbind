import { getFragmentByHash, toBoolean } from '../utils/utils';

export default {
  props: {
    type: {
      type: String,
      default: null,
    },
    expandable: {
      type: Boolean,
      default: true,
    },
    isOpen: {
      type: Boolean,
      default: null,
    },
    expanded: {
      type: Boolean,
      default: null,
    },
    minimized: {
      type: Boolean,
      default: false,
    },
    noSwitch: {
      type: Boolean,
      default: false,
    },
    noClose: {
      type: Boolean,
      default: false,
    },
    popupUrl: {
      type: String,
      default: null,
    },
    src: {
      type: String,
    },
    bottomSwitch: {
      type: Boolean,
      default: true,
    },
    preload: {
      type: Boolean,
      default: false,
    },
    addClass: {
      type: String,
      default: '',
    },
    expandHeaderless: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    // Vue 2.0 coerce migration
    expandableBool() {
      return toBoolean(this.expandable);
    },
    isOpenBool() {
      return toBoolean(this.isOpen);
    },
    expandedBool() {
      return toBoolean(this.expanded);
    },
    minimizedBool() {
      return toBoolean(this.minimized);
    },
    noSwitchBool() {
      return toBoolean(this.noSwitch);
    },
    noCloseBool() {
      return toBoolean(this.noClose);
    },
    bottomSwitchBool() {
      return toBoolean(this.bottomSwitch);
    },
    preloadBool() {
      return toBoolean(this.preload);
    },
    // Vue 2.0 coerce migration end
    hasHeaderBool() {
      return this.$slots.header;
    },
    isExpandableCard() {
      return this.expandableBool;
    },
    hasSrc() {
      return this.src && this.src.length > 0;
    },
    shouldShowHeader() {
      return (!this.localExpanded) || (!this.expandHeaderless);
    },
  },
  data() {
    /*
      Initialize data to expand and show all the panel content at the beginning.
      The data will be reassigned to what the user indicated after panel setup (in created / mounted).
    */
    return {
      localExpanded: true,
      localMinimized: false,
      wasRetrieverLoaded: true,
      collapsedPanelHeight: 0, // Will be >0 if show-preview mode
    };
  },
  methods: {
    toggle() {
      if (!this.wasRetrieverLoaded) {
        this.open();
        return;
      }

      if (this.localExpanded) {
        /*
          Collapse panel.
          Panel's maxHeight is 'none' at the moment, as event listener set it to 'none' after expansion.
          Thus, we need to reset the maxHeight to its current height (for collapse transition to work.
        */
        this.$refs.panel.style.maxHeight = `${this.$refs.panel.scrollHeight}px`;

        requestAnimationFrame(() => {
          // To enable behaviour of auto window scrolling during panel collapse
          if (this.$el.getBoundingClientRect().top < 0) {
            jQuery('html').animate({
              scrollTop: window.scrollY + this.$el.getBoundingClientRect().top - 3,
            }, 500, 'swing');
          }
          this.$refs.panel.style.maxHeight = `${this.collapsedPanelHeight}px`;
        });
      } else {
        // Expand panel
        this.$refs.panel.style.maxHeight = `${this.$refs.panel.scrollHeight}px`;
      }

      this.localExpanded = !this.localExpanded;
    },
    close() {
      this.localMinimized = true;
      this.localExpanded = false;
      /*
        We do not need transition for closing panels (changing to minimized).
        Thus, we do not use nextTick here.
      */
      this.$refs.panel.style.maxHeight = `${this.collapsedPanelHeight}px`;
    },
    open() {
      this.localMinimized = false;
      this.localExpanded = true;
      this.wasRetrieverLoaded = true;
      /*
        After setting minimized to false / wasRetrieverLoaded to true,
        we have to wait for DOM update (nextTick) before setting maxHeight for transition.
      */
      this.$nextTick(() => {
        this.$refs.panel.style.maxHeight = `${this.$refs.panel.scrollHeight}px`;
      });
    },
    openPopup() {
      window.open(this.popupUrl);
    },
    setMaxHeight() {
      if (this.preloadBool && !this.wasRetrieverLoaded) {
        // Only preload, do not expand the panel.
        return;
      }
      // Don't play the transition for this case as the loading should feel 'instant'.
      if (this.expandedBool) {
        this.$refs.panel.style.maxHeight = 'none';
        return;
      }

      // For expansion transition to 'continue' after src is loaded.
      this.$refs.panel.style.maxHeight = `${this.$refs.panel.scrollHeight}px`;
    },
    initCollapsedPanelHeight() {
      // To set panel's default collapsed panel height.
      this.collapsedPanelHeight = 0;
    },
    initPanel() {
      this.$refs.panel.addEventListener('transitionend', () => {
        /*
          If the panel's content grows, its height should accomodate it accordingly (e.g. nested panels).
          We will always set the panel's maxHeight to 'none' after expansion.
          This is to prevent maxHeight (which is used for transition) from restricting panel's growth.
        */
        if (this.localExpanded) {
          this.$refs.panel.style.maxHeight = 'none';
        }
      });

      this.wasRetrieverLoaded = this.localExpanded;

      if (this.minimizedBool && !this.localExpanded) {
        // If panel is minimized, simply close the panel.
        this.close();
        return;
      }

      // Set the initial height of panel.
      if (this.localExpanded) {
        this.$refs.panel.style.maxHeight = `${this.$refs.panel.scrollHeight}px`;
      } else {
        this.$refs.panel.style.maxHeight = `${this.collapsedPanelHeight}px`;
      }
    },
  },
  created() {
    if (this.src) {
      const hash = getFragmentByHash(this.src);
      if (hash) {
        this.fragment = hash;
        // eslint-disable-next-line prefer-destructuring
        this.src = this.src.split('#')[0];
      }
    }

    // Edge case where user might want non-expandable card that isn't expanded by default
    const notExpandableNoExpand = !this.expandableBool && this.expanded !== 'false';

    // Set local data to computed prop value

    // Ensure this expr ordering is maintained
    this.localExpanded = notExpandableNoExpand || this.expandedBool;
    if (this.localExpanded === null) {
      this.localExpanded = false;
    }

    if (this.minimizedBool && this.localExpanded) {
      /*
        User has indicated both minimized and expanded option.
        We will leave the panel expanded and minimize it.
        When user opens the minimized panel, it is automatically in expanded state (no transition).
      */
      this.localMinimized = true;
    }

    this.initCollapsedPanelHeight();
  },
  mounted() {
    this.initPanel();
  },
};
