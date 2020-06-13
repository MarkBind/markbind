<template>
  <div style="position: relative">
    <input type="text" class="form-control"
      :id="inputId"
      :placeholder="placeholder"
      autocomplete="off"
      v-model="value"
      @input="update"
      @keydown.up="up"
      @keydown.down="down"
      @keydown.enter= "hit"
      @keydown.esc="reset"
      @blur="showDropdown = false"
    />
    <ul :class="dropdownMenuClasses" ref="dropdown">
      <li v-for="(item, index) in items" v-bind:class="{'table-active': isActive(index)}">
        <a class="dropdown-item" @mousedown.prevent="hit" @mousemove="setActive(index)">
          <component v-bind:is="entryTemplate" :item="item" :value="value"></component>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import {delayer, getJSON} from './utils/utils.js'

let Vue = window.Vue
const _DELAY_ = 200

export default {
  created () {
    this.items = this.primitiveData
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    data: {
      type: Array
    },
    limit: {
      type: Number,
      default: 8
    },
    async: {
      type: String
    },
    key: {
      type: String,
      default: null
    },
    onHit: {
      type: Function,
      default (items) {
        this.reset()
        this.value = items
      }
    },
    placeholder: {
      type: String
    },
    delay: {
      type: Number,
      default: _DELAY_,
    },
    menuAlignRight: {
      type: Boolean,
      default: false
    },
    algolia: {
      type: Boolean,
      default: false
    }

  },
  data () {
    return {
      showDropdown: false,
      noResults: true,
      current: 0,
      items: []
    }
  },
  computed: {
    inputId () {
      return this.algolia ? "algolia-search-input" : null;
    },
    primitiveData () {
      if (this.data) {
        return this.data.filter(value => {
          value = this.matchCase ? value : value.toLowerCase()
          var query = this.matchCase ? this.value : this.value.toLowerCase()
          return this.matchStart ? value.indexOf(query) === 0 : value.indexOf(query) !== -1
        }).slice(0, this.limit)
      }
    },
    entryTemplate () {
      return 'typeaheadTemplate';
    },
    dropdownMenuClasses () {
      return ['dropdown-menu', 'search-dropdown-menu', {show: this.showDropdown},
        {'dropdown-menu-right': this.menuAlignRight}];
    }
  },
  methods: {
    update () {
      if (!this.value) {
        this.reset()
        return false
      }
      if (this.data) {
        this.items = this.primitiveData
        this.showDropdown = this.items.length > 0
      }
      if (this.async) this.query()
    },
    query: delayer(function () {
      getJSON(this.async + this.value).then(data => {
        this.items = (this.key ? data[this.key] : data).slice(0, this.limit)
        this.showDropdown = this.items.length
      })
    }, 'delay', _DELAY_),
    reset () {
      this.items = []
      this.value = ''
      this.loading = false
      this.showDropdown = false
    },
    setActive (index) {
      this.current = index
    },
    isActive (index) {
      return this.current === index
    },
    hit (e) {
      e.preventDefault()
      this.onHit(this.items[this.current], this)
    },
    up () {
      if (this.current > 0) this.current--
    },
    down () {
      if (this.current < this.items.length - 1) this.current++
    }
  },
  components: {
    typeaheadTemplate: {
      props: ['item', 'value'],
      template: '<span v-html="highlight(item, value)"></span>',
      methods: {
        highlight(value, phrase) {
          return value.replace(new RegExp(`(${phrase})`, 'gi'), '<mark>$1</mark>');
        },
      }
    },

  }
}
</script>

<style>
.dropdown-menu > li > a {
  cursor: pointer;
}
</style>
