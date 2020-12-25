<template>
  <div>
    <div class="fix">
      <a-upload-dragger
        name="file"
        :multiple="true"
        :showUploadList="false"
        :before-upload="beforeUpload"
        accept=".html"
        @change="handleChange"
      >
        <p class="ant-upload-drag-icon">
          <a-icon type="inbox" />
        </p>
        <p class="ant-upload-text">
          点击选择检测文件或者将检测文件拖拽到此处
        </p>
        <p class="ant-upload-hint">
          支持单次或批量上传
        </p>
      </a-upload-dragger>
      <div class="button-panel">
        <a-button @click="clearList" type="primary">
          清除
        </a-button>
        <router-link to="/setting">
          <a-button type="primary">
            设置关键词
          </a-button>
        </router-link>
      </div>
    </div>
    <div class="fix-next-content">
      <div
        v-for="(item, index) in resultList"
        :key="index"
        style="background:#ECECEC; padding:30px"
      >
        <a-card :title="item.title" :bordered="false">
          <div
            v-for="(itemChildren, indexChildren) in item.data"
            :key="indexChildren"
          >
            <p>
              {{ itemChildren.header }} 共{{ itemChildren.count }}条违规记录
            </p>
            <a-table
              :columns="columnsMap[itemChildren.header]"
              :data-source="itemChildren.data"
            >
            </a-table>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script>
import path from 'path'
const fs = require('fs')
// const cheerio = require('cheerio')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
export default {
  data () {
    return {
      enumType: {
        文件信息: 1,
        文件操作记录信息: 2,
        深度文件内容检查: 3
      },
      columnsMap: {
        文件信息: [
          { title: '是否违规', dataIndex: '是否违规' },
          { title: '序号', dataIndex: '序号' },
          { title: '文件名', dataIndex: '文件名' },
          { title: '文件路径', dataIndex: '文件路径' },
          { title: '关键字(次数)', dataIndex: '关键字(次数)' },
          { title: '文本片段', dataIndex: '文本片段' },
          { title: '密级', dataIndex: '密级' },
          { title: '疑似度', dataIndex: '疑似度' },
          { title: '文件大小(KB)', dataIndex: '文件大小(KB)' },
          { title: '创建时间', dataIndex: '创建时间' },
          { title: '访问时间', dataIndex: '访问时间' },
          { title: '修改时间', dataIndex: '修改时间' },
          { title: '用户名', dataIndex: '用户名' },
          { title: '文件所属应用', dataIndex: '文件所属应用' }
        ],
        文件操作记录信息: [
          { title: '是否违规', dataIndex: '是否违规' },
          { title: '序号', dataIndex: '序号' },
          { title: '文件名', dataIndex: '文件名' },
          { title: '文件路径', dataIndex: '文件路径' },
          { title: '操作日期', dataIndex: '操作日期' },
          { title: '用户名', dataIndex: '用户名' },
          { title: '硬盘位置', dataIndex: '硬盘位置' },
          { title: '来源', dataIndex: '来源' }
        ],
        深度文件内容检查: [
          { title: '是否违规', dataIndex: '是否违规' },
          { title: '序号', dataIndex: '序号' },
          { title: '文件名', dataIndex: '文件名' },
          { title: '文件路径', dataIndex: '文件路径' },
          { title: '关键字(次数)', dataIndex: '关键字(次数)' },
          { title: '文本片段', dataIndex: '文本片段' },
          { title: '密级', dataIndex: '密级' },
          { title: '疑似度', dataIndex: '疑似度' },
          { title: '文件大小(KB)', dataIndex: '文件大小(KB)' },
          { title: '创建时间', dataIndex: '创建时间' },
          { title: '访问时间', dataIndex: '访问时间' },
          { title: '修改时间', dataIndex: '修改时间' },
          { title: '用户名', dataIndex: '用户名' },
          { title: '文件所属应用', dataIndex: '文件所属应用' }
        ]
      },
      resultList: [
        // {
        //   name: "limingle",
        //   title: "limingle 共X条违规记录",
        //   data: [
        //     {
        //       header: "123123",
        //       data: [],
        // count: filterData.length
        //     }
        //   ]
        // }
      ]
    }
  },
  methods: {
    beforeUpload (file) {
      return false
    },
    clearList () {
      this.resultList = []
    },
    handleChange (info) {
      fs.readFile(info.file.path, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          let dom = new JSDOM(data, { runScripts: 'dangerously' })
          let domData = {}
          domData.name = dom.window.basicData[0].UserName
          domData.data = []
          for (let index = 1; index <= 3; index++) {
            if (dom.window['TableData' + index]) {
              let filterData = this.analysisList(
                dom.window['TableData' + index].data,
                this.enumType[dom.window['TableData' + index].header]
              )
              let convertData = this.convertData(
                filterData,
                dom.window['TableData' + index].header
              )
              domData.data.push({
                header: dom.window['TableData' + index].header,
                data: convertData,
                count: filterData.length
              })
            }
          }
          let countAll = domData.data.reduce((total, num) => {
            return total + num.count
          }, 0)
          domData.title = `${domData.name} 共${countAll}条违规记录`
          this.resultList.push(domData)
          // console.log(dom.window);
          dom = null
          // const $ = cheerio.load(data)
          // console.log($)
        }
      })
    },
    convertData (data, typeString) {
      return data.map((element, index) => {
        let obj = {}
        element.forEach((item, indexMap) => {
          obj[this.columnsMap[typeString][indexMap].dataIndex] = item
        })
        obj['key'] = index
        return obj
      })
    },
    analysisList (data, type) {
      let fileContents = fs.readFileSync(
        path.join(__dirname, './config.json'),
        'utf8'
      )
      let keyWord = JSON.parse(fileContents).regKeyWord
      let regKeyWord = new RegExp(keyWord)
      return data.filter(element => {
        switch (type) {
          case this.enumType.文件信息:
            return (
              element[0] === '1' ||
              this.regExpData(element[2] + element[3] + element[5], regKeyWord)
            )
            // break
          case this.enumType.文件操作记录信息:
            return (
              element[0] === '1' ||
              this.regExpData(element[2] + element[3], regKeyWord)
            )
            // break
          case this.enumType.深度文件内容检查:
            return (
              element[0] === '1' ||
              this.regExpData(
                element[2] + element[3] + element[4] + element[5],
                regKeyWord
              )
            )
            // break
          default:
            return false
            // break
        }
      })
    },
    regExpData (text, reg) {
      return reg.test(text)
    }
  }
}
</script>

<style scoped>
.fix {
  position: sticky;
  top: 0px;
  width: 100%;
  z-index: 10;
}
.fix-next-content {
}
.button-panel{
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
