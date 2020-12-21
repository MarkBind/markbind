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
    return {
      localExpanded: false,
      localMinimized: false,
      wasRetrieverLoaded: false,
      expandedPanelHeight: 0, // to be set dynamically
      collapsedPanelHeight: 0, // will be >0 if show-preview mode
    };
  },
  methods: {
    toggle() {
      if (this.localExpanded) {
        // COLLAPSE
        // panel maxHeight is 'none' at this moment (as event listener set it to 'none' after expansion)
        // thus, we need to reset the maxHeight to its current height (for collapse transition to work)
        this.$refs.panel.style.maxHeight = `${this.$refs.panel.scrollHeight}px`;
        // we need to reset / 'memorize' the expandedPanelHeight everytime we collapse
        // this is because we may have expanded nested panels and the parent panel height is now different
        this.expandedPanelHeight = this.$refs.panel.scrollHeight;
        // need to wait for DOM update, after resetting panel maxHeight
        setTimeout(() => {
          // transition to collapsed panel
          this.$refs.panel.style.maxHeight = `${this.collapsedPanelHeight}px`;
        }, 0); // nextTick doesn't work, not sure why :O
      } else {
        // EXPAND
        this.$refs.panel.style.maxHeight = `${this.expandedPanelHeight}px`;
        // we will always set maxHeight to 'none' after expansion
        // this is to accomodate the expansion of nested panels (parent panel needs to grow)
        // event listener will set maxHeight to none after transition ends for expansion
      }
      this.localExpanded = !this.localExpanded;
    },
    close() {
      this.localExpanded = false;
      this.localMinimized = true;
      // we need to reset / 'memorize' the expandedPanelHeight everytime we collapse
      // this is because we may have expanded nested panels and the parent panel height is now different
      this.expandedPanelHeight = this.$refs.panel.scrollHeight;
      this.$refs.panel.style.maxHeight = `${this.collapsedPanelHeight}px`;
      // we don't need transition for closing (change to minimized panel)
    },
    open() {
      this.localMinimized = false;
      // need to wait for DOM update, after setting minimized to false
      setTimeout(() => {
        // transition to expanded
        this.localExpanded = true;
        this.$refs.panel.style.maxHeight = `${this.expandedPanelHeight}px`;
      }, 0); // nextTick doesn't work, not sure why :O
    },
    openPopup() {
      window.open(this.popupUrl);
    },
    setExpandedPanelHeight() {
      this.expandedPanelHeight = this.$refs.panel.scrollHeight;
    },
    setCollapsedPanelHeight() {
      // to be used for setting preview's default collapsed panel height
      this.collapsedPanelHeight = 0;
    },
    setInitialPanelHeight() {
      if (this.minimizedBool) {
        // if panel is minimized, simply close the panel
        this.close();
        return;
      }

      // Edge case where user might want non-expandable card that isn't expanded by default
      const notExpandableNoExpand = !this.expandableBool && this.expanded !== 'false';

      // Set local data to computed prop value

      // Ensure this expr ordering is maintained
      this.localExpanded = notExpandableNoExpand || this.expandedBool;
      if (this.localExpanded === null) {
        this.localExpanded = false;
      }

      if (this.localExpanded) {
        this.$refs.panel.style.maxHeight = `${this.expandedPanelHeight}px`;
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
    // expand everything to retrieve the appropriate heights
    // ensure everything is rendered
    this.localMinimized = false;
    this.localExpanded = true;
    this.wasRetrieverLoaded = true;
  },
  mounted() {
    this.setExpandedPanelHeight();
    this.setCollapsedPanelHeight();
    this.setInitialPanelHeight();
    this.$refs.panel.addEventListener('transitionend', () => {
      // for nested panel, parent panel must not have a limited max-height, as it has to grow
      // if there are child panels that are expanded
      if (this.localExpanded) {
        this.$refs.panel.style.maxHeight = 'none';
      }
    });
  },
};
