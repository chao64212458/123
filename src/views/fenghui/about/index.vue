<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <!-- <crudOperation :permission="permission" /> -->
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="1280px" @opened="onDialogOpen">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="标题">
            <el-input v-model="form.title" :disabled="true" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="内容">
            <!-- <el-input v-model="form.content" :rows="3" type="textarea" style="width: 370px;" /> -->
          </el-form-item>
        </el-form>
        <div class="app-container">
          <el-row :gutter="10">
            <el-col :xs="24" :sm="24" :md="18" :lg="15" :xl="15">
              <div ref="editor" class="text" />
            </el-col>
            <el-col :xs="24" :sm="24" :md="6" :lg="9" :xl="9">
              <div v-html="editorContent" />
            </el-col>
          </el-row>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="aboutId" label="编号" width="100" />
        <el-table-column prop="title" label="标题" width="300" />
        <!-- <el-table-column prop="content" label="内容" /> -->
        <el-table-column v-if="checkPer(['admin','about:edit','about:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
              :disabled-dle="true"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudTAbout from '@/api/fenghui/about'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

import { upload } from '@/utils/upload'
import { mapGetters } from 'vuex'
import E from 'wangeditor'

const defaultForm = { aboutId: null, title: null, content: '', createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TAbout',
  components: { pagination, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '关于峰会', url: 'api/about', idField: 'aboutId', sort: 'aboutId,desc', crudMethod: { ...crudTAbout }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'about:add'],
        edit: ['admin', 'about:edit'],
        del: ['admin', 'about:del']
      },
      rules: {
      },
      editor: undefined,
      editorContent: '',
      height: document.documentElement.clientHeight - 200 + 'px'
    }
  },
  computed: {
    ...mapGetters([
      'imagesUploadApi',
      'videosUploadApi',
      'baseApi'
    ])
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.beforeToEdit](crud, form) {
      this.editorContent = `${form.content}`
      if (this.editor) {
        this.editor.txt.html(this.editorContent)
      }
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.editorContent = `${form.content}`
      if (this.editor) {
        this.editor.txt.html(this.editorContent)
      }
    },
    [CRUD.HOOK.afterValidateCU](crud) {
      crud.form.content = this.editorContent
    },
    onDialogOpen() {
      if (!this.editor) {
        this.initEditor()
      }
    },
    initEditor() {
      const _this = this
      console.log(this.$refs)
      this.editor = new E(this.$refs.editor)
      // 自定义菜单配置
      this.editor.config.zIndex = 10
      // 自定义图片文件上传
      this.editor.config.customUploadImg = function(files, insert) {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法
        files.forEach(image => {
          upload(_this.imagesUploadApi, image).then(res => {
            const data = res.data
            const url = _this.baseApi + '/file/' + data.type + '/' + data.realName
            insert(url)
          })
        })
      }
      // 自定义视频文件上传
      this.editor.config.customUploadVideo = function(files, insert) {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法
        files.forEach(video => {
          console.info(video)
          console.info('url:' + _this.videosUploadApi)
          upload(_this.videosUploadApi + '?name=' + video.name, video).then(res => {
            console.info(res)
            const data = res.data
            const url = _this.baseApi + '/file/' + data.type + '/' + data.realName
            insert(url)
          })
        })
      }

      this.editor.config.onchange = (html) => {
        this.editorContent = html
      }
      this.editor.create()
      // 初始化数据
      this.editor.txt.html(this.editorContent)
    },
    mounted() {
      window.onresize = function temp() {
        this.height = document.documentElement.clientHeight - 200 + 'px'
      }
    }
  }
}
</script>

<style scoped>
  .text {
    text-align:left;
  }
 ::v-deep .w-e-text-container {
    height: 420px !important;
  }
</style>
