<template>
  <div class="form-designer">
    <el-container>
      <!-- 左侧字段 -->
      <el-aside :width="leftWidth">
        <div class="fields-list">
          <div v-for="(field, index) in fields"
               :key="index">
            <template v-if="field.list.find(f => includeFields.includes(f.type))">
              <div class="field-title">{{field.title}}</div>
              <draggable tag="ul"
                         :list="field.list"
                         :group="{ name: 'form', pull: 'clone', put: false }"
                         ghost-class="ghost"
                         :sort="false">
                <template v-for="(item, cIndex) in field.list">
                  <li class="field-label"
                      v-if="includeFields.includes(item.type)"
                      :key="'c_' + cIndex">
                    <a @click="handleFieldClick(item)">
                      <i class="icon iconfont"
                         :class="item.icon"></i>
                      <span>{{item.title || item.label}}</span>
                    </a>
                  </li>
                </template>
              </draggable>
            </template>
          </div>
        </div>
      </el-aside>
      <!-- 中间主布局 -->
      <el-container class="widget-container"
                    direction="vertical">
        <el-header class="widget-container-header">
          <div style="display: flex; align-items: center;">
            <span style="flex-basis: 90px">问卷标题：</span><el-input size="small" v-model="questionnaireTitle" style="width: 400px" maxlength="30" placeholder="请填写问卷标题"></el-input>
          </div>
          <div style="display: flex; align-items: center;">
            <el-button v-if="toolbar.includes('generate')"
                       type="text"
                       size="medium"
                       icon="el-icon-check"
                       @click="handleGenerateJson">保存</el-button>
            <el-button v-if="toolbar.includes('preview')"
                       type="text"
                       size="medium"
                       icon="el-icon-view"
                       @click="handlePreview">预览</el-button>
            <template v-if="undoRedo">
              <el-button type="text"
                         size="medium"
                         icon="el-icon-refresh-left"
                         :disabled="historySteps.index == 0"
                         @click="widgetForm = handleUndo()">撤销</el-button>
              <el-button type="text"
                         size="medium"
                         icon="el-icon-refresh-right"
                         :disabled="historySteps.index == historySteps.steps.length - 1"
                         @click="widgetForm = handleRedo()">重做</el-button>
            </template>
            <el-button v-if="toolbar.includes('clear')"
                       class="danger"
                       type="text"
                       size="medium"
                       icon="el-icon-delete"
                       @click="handleClear">清空</el-button>
            <slot name="toolbar"></slot>
          </div>
        </el-header>
        <el-main :style="{background: widgetForm.column.length == 0 ? `url(${widgetEmpty}) no-repeat 50%`: ''}">
          <widget-form ref="widgetForm"
                       :data="widgetForm"
                       :select.sync="widgetFormSelect"
                       @change="handleHistoryChange(widgetForm)"></widget-form>
        </el-main>
      </el-container>
      <!-- 右侧配置 -->
      <el-aside class="widget-config-container"
                :width="rightWidth">
        <el-tabs v-model="configTab"
                 stretch>
          <el-tab-pane label="题目设置"
                       name="widget"
                       style="padding: 0 10px;">
            <widget-config :data="widgetFormSelect"
                           :default-values="defaultValues"></widget-config>
          </el-tab-pane>
        </el-tabs>
      </el-aside>
      <!-- 弹窗 -->
      <!-- 生成JSON -->
      <el-drawer title="生成JSON"
                 :visible.sync="generateJsonVisible"
                 size="50%"
                 append-to-body
                 destroy-on-close>
        <monaco-editor v-model="widgetFormPreview"
                       keyIndex="generate"
                       height="82%"
                       :read-only="true"></monaco-editor>
        <div class="drawer-foot">
          <el-button size="medium"
                     type="primary"
                     @click="handleGenerate">生成</el-button>

          <el-popover placement="top"
                      trigger="hover"
                      width="350px">
            <el-form v-model="configOption"
                     style="padding: 0 20px"
                     label-suffix="："
                     label-width="180px"
                     label-position="left">
              <el-form-item label="类型">
                <el-popover placement="top-start"
                            trigger="hover"
                            content="复制json对象"
                            style="margin-right: 15px;">
                  <el-radio slot="reference"
                            v-model="configOption.generateType"
                            label="json">json</el-radio>
                </el-popover>
                <el-popover placement="top-start"
                            trigger="hover"
                            content="复制string字符串，可直接用于后端保存无需再次处理。">
                  <el-radio slot="reference"
                            v-model="configOption.generateType"
                            label="string">string</el-radio>
                </el-popover>
              </el-form-item>
              <el-form-item label="缩进长度-空格数量">
                <el-slider v-model="configOption.space"
                           show-stops
                           :marks="{ 1: '1', 2: '2', 3: '3', 4: '4' }"
                           :min="1"
                           :max="4"
                           :step="1"></el-slider>
              </el-form-item>
              <el-form-item label="引号类型">
                <el-switch v-model="configOption.quoteType"
                           active-value="single"
                           inactive-value="double"
                           active-text="单引号"
                           inactive-text="双引号"></el-switch>
              </el-form-item>
              <el-form-item label="移除key的引号">
                <el-switch v-model="configOption.dropQuotesOnKeys"></el-switch>
              </el-form-item>
              <el-form-item label="移除数字字符串的引号">
                <el-switch v-model="configOption.dropQuotesOnNumbers"></el-switch>
              </el-form-item>
            </el-form>
            <el-button size="medium"
                       type="primary"
                       @click="handleCopy"
                       slot="reference"
                       style="margin-left: 10px;">复制</el-button>
          </el-popover>
        </div>
      </el-drawer>
      <!-- 预览 -->
      <el-drawer title="预览"
                 :visible.sync="previewVisible"
                 size="32%"
                 append-to-body
                 :before-close="handleBeforeClose">
        <avue-form v-if="previewVisible"
                   ref="form"
                   class="preview-form"
                   :option="widgetFormPreview"
                   v-model="widgetModels"
                   @submit="handlePreviewSubmit"></avue-form>
        <div class="drawer-foot">
          <!-- <el-button size="medium"
                     type="primary"
                     @click="handlePreviewSubmit">确定</el-button> -->
          <el-button size="medium"
                     type="danger"
                     @click="handleBeforeClose">取消</el-button>
        </div>
      </el-drawer>
    </el-container>
  </div>
</template>

<script>
import fields from './fieldsConfig.js'
import beautifier from './utils/json-beautifier'
import MonacoEditor from './utils/monaco-editor'
import widgetEmpty from './assets/widget-empty.png'
import history from './mixins/history'

import Draggable from 'vuedraggable'

import WidgetForm from './WidgetForm'
// import FormConfig from './FormConfig'
import WidgetConfig from './WidgetConfig'

export default {
  name: "FormDesign",
  components: { Draggable, MonacoEditor, WidgetForm, WidgetConfig },
  mixins: [history],
  props: {
    options: {
      type: [Object, String],
      default: () => {
        return {
          column: []
        }
      }
    },
    storage: {
      type: Boolean,
      default: false
    },
    asideLeftWidth: {
      type: [String, Number],
      default: '270px'
    },
    asideRightWidth: {
      type: [String, Number],
      default: '380px'
    },
    showGithubStar: {
      type: Boolean,
      default: true
    },
    toolbar: {
      type: Array,
      default: () => {
        return ['import', 'generate', 'preview', 'clear']
      }
    },
    undoRedo: {
      type: Boolean,
      default: true
    },
    includeFields: {
      type: Array,
      default: () => {
        const arr = []
        fields.forEach(f => {
          f.list.forEach(c => {
            arr.push(c.type)
          })
        })
        return arr
      }
    },
    customFields: {
      type: Array,
    },
    defaultValues: {
      type: Object
    },
  },
  watch: {
    options: {
      handler(val) {
        let options = val
        if (typeof options == 'string') {
          try {
            options = eval('(' + options + ')')
          } catch (e) {
            console.error('非法配置')
            options = { column: [] }
          }
        }
        this.transAvueOptionsToFormDesigner(options).then(res => {
          this.widgetForm = { ...this.widgetForm, ...res }
        })
      },
      deep: true
    }
  },
  computed: {
    leftWidth() {
      if (typeof this.asideLeftWidth == 'string') {
        return this.asideLeftWidth
      } else {
        return `${this.asideLeftWidth}px`
      }
    },
    rightWidth() {
      if (typeof this.asideRightWidth == 'string') {
        return this.asideRightWidth
      } else {
        return `${this.asideRightWidth}px`
      }
    }
  },
  data() {
    return {
      questionnaireTitle: '',
      // 表单类型，00-单行文本框，01-单选，02-多选，03-多行文本框，04-标题, 05-下拉选择器, 06-上传，07-日期，08-时间
      type: { input: '00', radio: '01', checkbox: '02', textarea: '03',  title: '04', select: '05', upload: '06', date:'07', time: '08' },
      widgetEmpty,
      fields,
      widgetForm: {
        column: [],
        labelPosition: 'top',
        labelSuffix: ' ',
        labelWidth: 120,
        gutter: 0,
        menuBtn: false,
        submitBtn: true,
        submitText: '提交',
        emptyBtn: true,
        emptyText: '清空',
        menuPosition: 'center'
      },
      widgetFormPreview: {},
      configTab: 'widget',
      widgetFormSelect: {},
      previewVisible: false,
      generateJsonVisible: false,
      importJsonVisible: false,
      importJson: {},
      widgetModels: {},
      configOption: {
        generateType: 'json',
        space: 2,
        quoteType: 'single',
        dropQuotesOnKeys: true
      },
      history: {
        index: 0, // 当前下标
        maxStep: 20, // 最大记录步数
        steps: [], // 历史步数
      }
    }
  },
  mounted() {
    this.handleLoadStorage()
    this.handleLoadCss()
  },
  methods: {
    // 组件初始化时加载本地存储中的options(需开启storage),若不存在则读取用户配置的options
    async handleLoadStorage() {
      let options = this.options
      if (typeof options == 'string') {
        try {
          options = eval('(' + options + ')')
        } catch (e) {
          console.error('非法配置')
          options = { column: [] }
        }
      }
      if (!options.column) options.column = []
      this.widgetForm = this.initHistory({
        index: 0,
        maxStep: 20,
        steps: [await this.transAvueOptionsToFormDesigner({ ...this.widgetForm, ...options })],
        storage: this.storage
      })

      if (this.undoRedo) {
        window.addEventListener('keydown', (evt) => {
          // 监听 cmd + z / ctrl + z 撤销
          if ((evt.metaKey && !evt.shiftKey && evt.keyCode == 90) || (evt.ctrlKey && !evt.shiftKey && evt.keyCode == 90)) {
            this.widgetForm = this.handleUndo()
          }

          // 监听 cmd + shift + z / ctrl + shift + z / ctrl + y 重做
          if ((evt.metaKey && evt.shiftKey && evt.keyCode == 90) || (evt.ctrlKey && evt.shiftKey && evt.keyCode == 90) || (evt.ctrlKey && evt.keyCode == 89)) {
            this.widgetForm = this.handleRedo()
          }
        }, false)
      }

    },
    // 加载icon
    handleLoadCss() {
      const head = document.getElementsByTagName('head')[0]
      const script = document.createElement('link')
      script.rel = 'stylesheet'
      script.type = 'text/css'
      script.href = 'https://at.alicdn.com/t/font_1254447_zc9iezc230c.css'
      head.appendChild(script)
      // this.loadScript('css', 'https://at.alicdn.com/t/font_1254447_zc9iezc230c.css')
    },
    // Avue文档链接
    handleAvueDoc() {
      window.open('https://avuejs.com/doc/form/form-doc', '_blank')
    },
    // 左侧字段点击
    handleFieldClick(item) {
      const activeIndex = this.widgetForm.column.findIndex(c => c.prop == this.widgetFormSelect.prop) + 1
      let newIndex = 0
      if (activeIndex == -1) {
        this.widgetForm.column.push(item)
        newIndex = this.widgetForm.column.length - 1
      } else {
        this.widgetForm.column.splice(activeIndex, 0, item)
        newIndex = activeIndex
      }

      this.$refs.widgetForm.handleWidgetAdd({ newIndex })
    },
    // 预览 - 弹窗
    handlePreview() {
      if (!this.widgetForm.column || this.widgetForm.column.length == 0) this.$message.error("没有需要展示的内容")
      else {
        this.transformToAvueOptions(this.widgetForm).then(data => {
          this.widgetFormPreview = data
          this.previewVisible = true
        })
      }
    },
    // 导入JSON - 弹窗 - 确定
    handleImportJsonSubmit() {
      try {
        this.transAvueOptionsToFormDesigner(this.importJson).then(res => {
          this.widgetForm = res
          this.importJsonVisible = false
          this.handleHistoryChange(this.widgetForm)
        })
      } catch (e) {
        this.$message.error(e.message)
      }
    },
    // 生成JSON - 弹窗
    handleGenerateJson() {
      if (!this.questionnaireTitle) {
        this.$message.error('请填写问卷标题');
        return;
      }
      let data = [];
      this.widgetForm.column.forEach((item) => {
        data.push({
          formPlaceholder: item.placeholder ? item.placeholder : '',
          formType: this.type[item.type],
          formTitle: item.label ? item.label : '',
          formValue: item.dicData ? JSON.stringify(item.dicData) : '',
          isRequired: item.required ? '00' : '01'  // 00-必输，01-非必输
        });
      })

      this.$emit('saveJson', { fromFiled: data, questionnaireTitle: this.questionnaireTitle});
      console.log({ fromFiled: data, questionnaireTitle: this.questionnaireTitle})
      // this.transformToAvueOptions(this.widgetForm).then(data => {
      //   this.widgetFormPreview = data
      //   this.generateJsonVisible = true
      // })
    },
    // 生成JSON - 弹窗 - 确定
    handleGenerate() {
      this.transformToAvueOptions(this.widgetForm).then(data => {
        if (this.configOption.generateType && this.configOption.generateType == 'string') this.$emit('submit', beautifier(data, {
          minify: true,
          ...this.configOption
        }))
        else this.$emit('submit', data)
      })
    },
    // 生成JSON - 弹窗 - 拷贝
    handleCopy() {
      this.transformToAvueOptions(this.widgetForm).then(data => {
        this.$Clipboard({
          text: beautifier(data, {
            minify: true,
            ...this.configOption
          })
        }).then(() => {
          this.$message.success('复制成功')
        }).catch(() => {
          this.$message.error('复制失败')
        })
      })
    },
    // 预览 - 弹窗 - 确定
    handlePreviewSubmit(form, done) {
      if (done) {
        this.$alert(this.widgetModels).then(() => {
          done()
        }).catch(() => {
          done()
        })
      } else {
        this.$refs.form.validate((valid, done) => {
          if (valid) this.$alert(this.widgetModels).then(() => {
            done()
          }).catch(() => {
            done()
          })
        })
      }
    },
    // 预览 - 弹窗 - 关闭前
    handleBeforeClose() {
      this.$refs.form.resetForm()
      this.widgetModels = {}
      this.previewVisible = false
    },
    // 清空
    handleClear() {
      if (this.widgetForm && this.widgetForm.column && this.widgetForm.column.length > 0) {
        this.$confirm('确定要清空吗？', '警告', {
          type: 'warning'
        }).then(() => {
          this.$set(this.widgetForm, 'column', [])
          this.$set(this, 'widgetModels', {})
          this.$set(this, 'widgetFormSelect', {})
          this.handleHistoryChange(this.widgetForm)
        }).catch(() => {
        })
      } else this.$message.error("没有需要清空的内容")
    },
    // 表单设计器配置项 转化为 Avue配置项
    transformToAvueOptions(obj) {
      return new Promise((resolve, reject) => {
        try {
          const data = this.deepClone(obj)
          for (let i = 0; i < data.column.length; i++) {
            const col = data.column[i]
            if (col.type == 'dynamic' && col.children && col.children.column && col.children.column.length > 0) {
              const c = col.children.column;
              c.forEach(item => {
                delete item.subfield
              })
              this.transformToAvueOptions(col.children).then(res => {
                col.children = res
              })
            } else if (col.type == 'group') {
              if (!data.group) data.group = []

              const group = {
                label: col.label,
                icon: col.icon,
                prop: col.prop,
                arrow: col.arrow,
                collapse: col.collapse,
                display: col.display
              }
              this.transformToAvueOptions(col.children).then(res => {
                group.column = res.column
                data.group.push(group)
              })
              data.column.splice(i, 1)
              i--
            } else if (['checkbox', 'radio', 'tree', 'cascader', 'select'].includes(col.type)) {
              if (col.dicOption == 'static') {
                delete col.dicUrl
                delete col.dicMethod
                delete col.dicQuery
                delete col.dicQueryConfig
              } else if (col.dicOption == 'remote') {
                delete col.dicData
                if (col.dicQueryConfig && col.dicQueryConfig.length > 0) {
                  const query = {}
                  col.dicQueryConfig.forEach(q => {
                    if (q.key && q.value) query[q.key] = q.value
                  })
                  col.dicQuery = query
                  delete col.dicQueryConfig
                } else delete col.dicQueryConfig
              }
              delete col.dicOption
            } else if (['upload'].includes(col.type)) {
              if (col.headersConfig && col.headersConfig.length > 0) {
                const headers = {}
                col.headersConfig.forEach(h => {
                  if (h.key && h.value) headers[h.key] = h.value
                })
                col.headers = headers
              } else delete col.headers
              delete col.headersConfig

              if (col.dataConfig && col.dataConfig.length > 0) {
                const data = {}
                col.dataConfig.forEach(h => {
                  if (h.key && h.value) data[h.key] = h.value
                })
                col.data = data
              } else delete col.data
              delete col.dataConfig
            }
          }
          resolve(data)
        } catch (e) {
          reject(e)
        }
      })
    },
    // Avue配置项 转化为 表单设计器配置项
    transAvueOptionsToFormDesigner(obj) {
      if (typeof obj == 'string') obj = eval('(' + obj + ')')
      const data = this.deepClone(obj)
      return new Promise((resolve, reject) => {
        try {
          if (data.column && data.column.length > 0) {
            data.column.forEach(col => {
              if (col.type == 'dynamic' && col.children && col.children.column && col.children.column.length > 0) {
                const c = col.children.column;
                c.forEach(item => {
                  item.subfield = true
                })
                this.transAvueOptionsToFormDesigner(col.children).then(res => {
                  col.children = res
                })
              } else if (['checkbox', 'radio', 'tree', 'cascader', 'select'].includes(col.type)) {
                if (!col.dicData && col.dicQuery && typeof col.dicQuery == 'object') {
                  const arr = []
                  for (let key in col.dicQuery) {
                    arr.push({
                      key,
                      value: col.dicQuery[key],
                      $cellEdit: true
                    })
                  }
                  col.dicQueryConfig = arr
                }
                if (col.dicUrl) col.dicOption = 'remote'
                else col.dicOption = 'static'
                if (!col.dicData) col.dicData = []
              } else if (['upload'].includes(col.type)) {
                if (col.headers && typeof col.headers == 'object') {
                  const arr = []
                  for (let key in col.headers) {
                    arr.push({
                      key,
                      value: col.headers[key],
                      $cellEdit: true
                    })
                  }
                  col.headersConfig = arr
                } else col.headersConfig = []

                if (col.data && typeof col.data == 'object') {
                  const arr = []
                  for (let key in col.data) {
                    arr.push({
                      key,
                      value: col.data[key],
                      $cellEdit: true
                    })
                  }
                  col.dataConfig = arr
                } else col.dataConfig = []
              }
            })
          }
          if (data.group && data.group.length > 0) {
            for (let i = 0; i < data.group.length; i++) {
              if (!data.column) data.column = []
              const col = data.group[i]

              const group = {
                type: 'group',
                label: col.label,
                icon: col.icon,
                prop: col.prop,
                arrow: col.arrow,
                collapse: col.collapse,
                display: col.display
              }
              this.transAvueOptionsToFormDesigner(col).then(res => {
                group.children = res
                data.column.push(group)
              })
            }
            delete data.group
          }
          resolve(data)
        } catch (e) {
          reject(e)
        }
      })
    },
    async getData(type = 'json') {
      if (type == 'string') return beautifier(await this.transformToAvueOptions(this.widgetForm), {
        minify: true
      })
      else return await this.transformToAvueOptions(this.widgetForm)
    }
  }
}
</script>

<style lang="scss">
@import './styles/index.scss';
</style>
