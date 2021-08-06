<template>
  <div class="widget-config">
    <el-form label-suffix="："
             v-if="this.data && Object.keys(this.data).length > 0"
             labelPosition="left"
             labelWidth="90px"
             size="small">
          
          <!-- 标题类型不需要设表单标题 -->
          <el-form-item label="标题" v-if="data.type !== 'title'">
            <el-input v-model="data.label"
                      clearable
                      placeholder="标题"></el-input>
          </el-form-item>

          <!-- 标题类型设置内容 -->
          <el-form-item v-if="data.type === 'title'"
                        label="标题内容">
              <el-input type="textarea" rows="6" maxlength="200" v-model="data.value"
                        clearable
                        placeholder="标题内容"></el-input>
          </el-form-item>
          <component :is="getComponent"
                     :data="data"
                     :default-values="defaultValues"></component>
    </el-form>
    <avue-empty v-else
                desc="拖拽字段进行配置"
                style="margin-top: 100%;"></avue-empty>
  </div>
</template>

<script>
import fields from './fieldsConfig.js'

const dateArr = [
  'year', 'month', 'week', 'date', 'datetime', 'time', 'daterange', 'timerange', 'datetimerange', 'dates'
]

export default {
  name: 'widget-config',
  props: ['data', 'defaultValues'],
  computed: {
    getComponent() {
      const prefix = 'config-'
      const { type, component } = this.data
      if ((!type || component) && type != 'ueditor') return prefix + 'custom'
      let result = 'input'

      if ([undefined, 'input', 'password', 'url'].includes(type)) result = 'input'
      else if (dateArr.includes(type)) result = 'date'
      else if (['array', 'img'].includes(type)) result = 'array'
      else if (['tree', 'cascader'].includes(type)) result = 'tree'
      else if (['radio', 'checkbox', 'select'].includes(type)) result = 'select'
      else result = type

      return prefix + result
    }
  },
  data() {
    return {
      fields,
      collapse: ['1', '2']
    }
  },
  methods: {
    async handleChangeType(type) {
      if (type) {
        const config = await this.getConfigByType(type);
        config.prop = this.data.prop;
        for (let key in config) {
          if (config && Object.prototype.hasOwnProperty.call(config, key) && !['icon', 'label', 'span'].includes(key)) {
            const val = config[key]
            this.$set(this.data, key, val);
          }
        }
      }
    },
    getConfigByType(type) {
      return new Promise((resolve, reject) => {
        fields.forEach(field => {
          field.list.forEach(config => {
            if (config.type == type) resolve(config)
          })
        })
        reject()
      })
    }
  }
}
</script>
