import { getFragmentByHash, toBoolean, toNumber } from '../utils/utils';

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
      return this.$slots._header || this.$slots.header;
    },
    isExpandableCard() {
      return this.expandableBool;
    },
    hasSrc() {
      return this.src && this.src.length > 0;
    },
  },
  data() {
    return {
      localExpanded: false,
      localMinimized: false,
      wasRetrieverLoaded: false,
    };
  },
  methods: {
    toggle() {
      if (!this.wasRetrieverLoaded && !this.localExpanded) {
        /*
        Let the retriever load before toggling localExpanded which triggers the animation,
        as we need to know the scrollHeight of the content for the animation to work.
        */
        this.wasRetrieverLoaded = true;
        this.$nextTick(() => this.localExpanded = true);
      } else {
        this.localExpanded = !this.localExpanded;
      }
    },
    close() {
      this.localExpanded = false;
      this.localMinimized = true;
    },
    open() {
      this.wasRetrieverLoaded = true;
      this.$nextTick(() => this.localExpanded = true);
      this.localMinimized = false;
    },
    openPopup() {
      window.open(this.popupUrl);
    },
    setMaxHeight() {
      // Don't play the transition for this case as the loading should feel 'instant'
      if (this.expandedBool) {
        this.$refs.panel.style.maxHeight = 'none';
        return;
      }
      
      /*
      Otherwise, since the vue transition is dependent on localExpanded, we have to manually
      set our own transition end handlers here for the initial loading of the content.
      */
      const onExpandDone = () => {
        this.$refs.panel.style.maxHeight = 'none';
        this.$refs.panel.removeEventListener('transitionend', onExpandDone);
      };
      
      this.$refs.panel.addEventListener('transitionend', onExpandDone);
      this.$refs.panel.style.maxHeight = `${this.$refs.panel.scrollHeight}px`;
    },
    beforeExpand(el) {
      el.style.maxHeight = '0';
    },
    duringExpand(el) {
      jQuery("html").stop();
      el.style.maxHeight = `${el.scrollHeight}px`;
    },
    afterExpand(el) {
      el.style.maxHeight = 'none';
    },
    beforeCollapse(el) {
      el.style.maxHeight = `${el.scrollHeight}px`;
    },
    duringCollapse(el) {
      if (this.$el.getBoundingClientRect().top < 0) {
        jQuery("html").animate({
          scrollTop: window.scrollY + this.$el.getBoundingClientRect().top - 3
        }, 500, 'swing')
      }
      el.style.maxHeight = '0';
    },
  },
  created() {
    if (this.src) {
      const hash = getFragmentByHash(this.src);
      if (hash) {
        this.fragment = hash;
        this.src = this.src.split('#')[0];
      }
    }
    // Edge case where user might want non-expandable card that isn't expanded by default
    const notExpandableNoExpand = !this.expandableBool && this.expanded !== 'false';
    // Set local data to computed prop value
    this.localExpanded = notExpandableNoExpand || this.expandedBool; // Ensure this expr ordering is maintained
    this.wasRetrieverLoaded = this.localExpanded; // If it is expanded, load the retriever immediately.
    this.localMinimized = this.minimizedBool;
  },
};
