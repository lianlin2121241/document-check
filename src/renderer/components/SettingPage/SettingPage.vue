<template>
  <div>
    <div class="button-panel">
      <router-link to="/">
        <a-button type="link">
          &lt; 返回
        </a-button>
      </router-link>
      <a-button @click="saveKeyWord" type="primary">
        保存
      </a-button>
    </div>
    <a-textarea
      v-model="value"
      placeholder="请输入关键词以|分割"
      :auto-size="{ minRows: 10 }"
    />
  </div>
</template>

<script>
import path from 'path'
const fs = require('fs')
export default {
  data () {
    return {
      value: '',
      parseJson: {}
    }
  },
  mounted () {
    this.getKeyWord()
  },
  methods: {
    getKeyWord () {
      let fileContents = fs.readFileSync(
        path.join(__dirname, '/config.json'),
        'utf8'
      )
      this.parseJson = JSON.parse(fileContents)
      this.value = this.parseJson.regKeyWord
    },
    saveKeyWord () {
      this.parseJson.regKeyWord = this.value
      fs.writeFileSync(
        path.join(__dirname, './config.json'),
        JSON.stringify(this.parseJson),
        'utf8'
      )
      this.$message.success(
        '保存成功'
      )
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.button-panel {
  background-color: #ffffff;
  padding: 10px 0px;
}
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}

.items {
  margin-top: 8px;
}

.item {
  display: flex;
  margin-bottom: 6px;
}

.item .name {
  color: #6a6a6a;
  margin-right: 6px;
}

.item .value {
  color: #35495e;
  font-weight: bold;
}
</style>
