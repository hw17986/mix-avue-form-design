import Input from './input.vue'
import Textarea from './textarea.vue'
import Select from './select.vue'
import Date from './date.vue'
import Upload from './upload.vue'
import Title from './title.vue'

const components = [
  Input,
  Textarea,
  Select,
  Date,
  Upload,
  Title
]

const Config = {
  install (Vue) {
    if (this.installed) return
    this.installed = true

    components.map(component => {
      Vue.component(component.name, component);
    })
  }
}

export default Config
