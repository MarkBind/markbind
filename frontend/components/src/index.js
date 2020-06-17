import affix from './Affix.vue'
import closeable from './directives/Closeable'
import dropdown from './Dropdown.vue'
import navbar from './Navbar.vue'
import panel from './Panel.vue'
import pic from './Pic.vue'
import question from './Question.vue'
import retriever from './Retriever.vue'
import searchbar from './Searchbar.vue'
import tab from './Tab.vue'
import tabGroup from './TabGroup.vue'
import tabset from './Tabset.vue'
import thumbnail from './Thumbnail.vue'
import tipBox from './TipBox.vue'
import typeahead from './Typeahead.vue'

const components = {
  affix,
  box: tipBox,
  dropdown,
  navbar,
  panel,
  pic,
  question,
  retriever,
  searchbar,
  tab,
  tabGroup,
  tabs: tabset,
  thumbnail,
  tipBox,
  typeahead,
}

const directives = {
  closeable,
}

function install (Vue) {
  if (install.installed) return
  install.installed = true

  Object.keys(directives).forEach((key) => {
    Vue.directive(key, directives[key])
  })
  Object.keys(components).forEach((key) => {
    Vue.component(key, components[key])
  })
}

const VueStrap = {
  install,
  components: {}
}

Object.keys(components).forEach((key) => {
  VueStrap.components[key] = components[key]
})

module.exports = VueStrap
