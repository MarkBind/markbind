import affix from './Affix.vue'
import closeable from './directives/Closeable'
import dropdown from './Dropdown.vue'
import navbar from './Navbar.vue'
import panel from './Panel.vue'
import pic from './Pic.vue'
import quiz from './questions/Quiz.vue'
import question from './questions/Question.vue'
import qOption from './questions/QOption.vue'
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
  quiz,
  question,
  qOption,
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

const MarkBindVue = {
  install,
  components: {}
}

Object.keys(components).forEach((key) => {
  MarkBindVue.components[key] = components[key]
})

module.exports = MarkBindVue
