export default [
  {
    title: '标题',
    list: [{
      type: 'title',
      icon: 'icon-title',
      span: 24,
      display: true,
      styles: {
        fontSize: '18px',
        color: '#000'
      },
      label: '标题',
      labelWidth: '0px',
      value: '标题',
    }]
  },
  {
    title: '填空题',
    list: [{
      type: 'input',
      label: '单行填空',
      icon: 'icon-input',
      span: 24
    }, {
      type: 'textarea',
      label: '多行填空',
      icon: 'icon-textarea',
      span: 24
    }]
  },
  {
    title: '选择题',
    list: [{
      type: 'radio',
      label: '单选',
      icon: 'icon-radio',
      dicData: [
        { label: '选项一', value: '0' },
        { label: '选项二', value: '1' },
        { label: '选项三', value: '2' },
      ],
      span: 24,
      dicOption: 'static'
    }, {
      type: 'checkbox',
      label: '多选',
      icon: 'icon-checkbox',
      dicData: [
        { label: '选项一', value: '0' },
        { label: '选项二', value: '1' },
        { label: '选项三', value: '2' },
      ],
      span: 24,
      dicOption: 'static'
    }, {
      type: 'select',
      label: '下拉选择',
      icon: 'icon-select',
      dicData: [
        { label: '选项一', value: '0' },
        { label: '选项二', value: '1' },
        { label: '选项三', value: '2' },
      ],
      span: 24
    }]
  },
  {
    title: '上传',
    list: [{
      type: 'upload',
      label: '上传',
      icon: 'icon-upload',
      span: 24
    }],
  },
  {
    title: '日期时间',
    list: [{
      type: 'date',
      label: '日期',
      icon: 'icon-date',
      span: 24,
      format: 'yyyy-MM-dd',
      valueFormat: 'yyyy-MM-dd'
    }, {
      type: 'time',
      label: '时间',
      icon: 'icon-time',
      span: 24,
      format: 'HH:mm:ss',
      valueFormat: 'HH:mm:ss'
    }],
  }
]
