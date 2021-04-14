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
    peek: {
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
      return this.$scopedSlots.header;
    },
    isExpandableCard() {
      return this.expandableBool;
    },
    hasSrc() {
      return this.src && this.src.length > 0;
    },
    srcWithoutFragment() {
      return this.src.split('#')[0];
    },
    shouldShowHeader() {
      return (!this.localExpanded) || (!this.expandHeaderless);
    },
    shouldShowPeek() {
      return this.peek && !this.localExpanded;
    },
    collapsedPanelHeight() {
      return this.peek ? 125 : 0;
    },
  },
  data() {
    return {
      localExpanded: false,
      localMinimized: false,
      wasRetrieverLoaded: false,
      isRetrieverLoadDone: !this.src, // Load is done by default if there is no src
      fragment: '',
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
          Thus, we need to reset the maxHeight to its current height for collapse transition to work.
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
    },
    open() {
      this.localMinimized = false;
      /*
        After setting minimized to false, we have to wait for panel to be rendered in the
        DOM update (nextTick) before we can initialize the panel with event listeners.
      */
      this.$nextTick(() => {
        this.initPanel();
        this.localExpanded = true;
        this.wasRetrieverLoaded = true;
        /*
          After setting wasRetrieverLoaded to true, we have to wait for
          DOM update (nextTick) before setting maxHeight for transition.
        */
        this.$nextTick(() => {
          this.$refs.panel.style.maxHeight = `${this.$refs.panel.scrollHeight}px`;
        });
      });
    },
    openPopup() {
      window.open(this.popupUrl);
    },
    retrieverUpdateMaxHeight() {
      // src has finished loaded -- we set this flag to true so our event listener can set maxHeight to none
      this.isRetrieverLoadDone = true;

      if (!this.localExpanded) {
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
    initPanel() {
      this.$refs.panel.addEventListener('transitionend', (event) => {
        /*
          If the panel's content grows, its maxHeight should accomodate it accordingly (e.g. nested panels).

          However, if the panel has a 'src' attribute and it has not finished loading,
          then this is delegated later to the retriever src-loaded event handler,
          allowing a second maxHeight transition once it is loaded.
        */
        if (this.localExpanded && this.isRetrieverLoadDone && event.target === this.$refs.panel) {
          this.$refs.panel.style.maxHeight = 'none';
        }
      });

      // Set the initial height of panel.
      if (this.localExpanded) {
        /*
          User has indicated expanded option for the panel.
          We have to set the maxHeight to none immediately since there won't be any transitions
          to trigger the event listener to set maxHeight to none.
        */
        this.$refs.panel.style.maxHeight = 'none';
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

    this.wasRetrieverLoaded = this.localExpanded || this.peek;
    this.localMinimized = this.minimizedBool;
  },
  mounted() {
    if (!this.localMinimized) {
      this.initPanel();
    }
  },
};
