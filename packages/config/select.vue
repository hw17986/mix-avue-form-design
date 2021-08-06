<template>
  <div>
    <el-form-item v-if="data.type == 'select'"
                  label="提示文字">
      <el-input v-model="data.placeholder"
                clearable
                placeholder="提示文字"></el-input>
    </el-form-item>

    <div class="el-form-item el-form-item--small el-form--label-top">
      <label class="el-form-item__label"
             style="padding: 0;">编辑选项：</label>
      <div class="el-form-item__content">
            <draggable tag="ul"
                       :list="data.dicData"
                       :group="{ name: 'dic' }"
                       ghost-class="ghost"
                       handle=".drag-item">
              <li v-for="(item, index) in data.dicData"
                  :key="index">
                <i class="drag-item el-icon-s-operation"
                   style="font-size: 16px; margin: 0 5px; cursor: move;"></i>
                <el-input style="margin-right: 5px;"
                          size="mini"
                          clearable
                          v-model="item.label"
                          :rules="[{ required: true, message: '请填写用户名' }]"
                          placeholder=""></el-input>
                <el-button @click="handleRemoveFields(index)"
                           circle
                           plain
                           type="danger"
                           size="mini"
                           icon="el-icon-minus"
                           style="padding: 4px;margin-left: 5px;"></el-button>
              </li>
            </draggable>
            <div style="margin-left: 22px;">
              <el-button type="text"
                         @click="handleAddFields">添加选项
              </el-button>
            </div>
      </div>
    </div>
    <el-form-item label="是否必填">
      <el-switch v-model="data.required"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'

export default {
  name: "config-select",
  props: ['data'],
  components: { Draggable },
  data() {
    return {
      validator: {
        type: null,
        required: null,
        pattern: null,
        length: null
      },
      option: {
        column: [{
          type: 'input',
          prop: 'key',
          label: 'key'
        }, {
          type: 'input',
          prop: 'value',
          label: 'value'
        }]
      },
    }
  },
  methods: {
    generateRule() {
      const rules = [];
      Object.keys(this.validator).forEach(key => {
        if (this.validator[key]) rules.push(this.validator[key])
      })
      this.data.rules = rules
    },
    handleRemoveFields(index) {
      this.data.dicData.splice(index, 1)
    },
    handleAddFields() {
      // let len = this.data.dicData.length;
      // if (!this.data.dicData[len - 1].label) {
      //   this.$message.error('选项内容不能为空')
      // }
      const i = Math.ceil(Math.random() * 99999)
      this.data.dicData.push({ label: ``, value: `col_${i}` })
    },
    handleRemoveCascaderItemFields(index) {
      this.data.cascaderItem.splice(index, 1)
    },
    handleAddCascaderItemFields() {
      this.data.cascaderItem.push('')
    },
    handleTabClick({ name }) {
      if (name == 'remote' && !this.data.dicQueryConfig) this.data.dicQueryConfig = []
    }
  },
  watch: {
    'data.required': function (val) {
      if (val) this.validator.required = { required: true, message: `请选择${this.data.label}` }
      else this.validator.required = null

      this.generateRule()
    },
  }
}
</script>
