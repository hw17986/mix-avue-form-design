<template>
  <div>
    <el-form-item label="提示文字">
      <el-input v-model="data.placeholder"
                clearable
                placeholder="提示文字"></el-input>
    </el-form-item>
    <el-form-item label="是否必填">
      <el-switch v-model="data.required"></el-switch>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: "config-input",
  props: ['data', 'defaultValues'],
  data() {
    return {
      validator: {
        type: null,
        required: null,
        // pattern: null,
        // length: null
      }
    }
  },
  methods: {
  },
}
</script>
