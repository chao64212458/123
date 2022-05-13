<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">标题</label>
        <el-input v-model="query.title" clearable placeholder="标题" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">影像分类</label>
        <!-- <el-input v-model="query.videoType" clearable placeholder="影像分类" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" /> -->
        <el-select v-model="query.videoType" clearable placeholder="请选择" class="filter-item" @keyup.enter.native="crud.toQuery">
          <el-option
            v-for="item in dict.report_type"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="1280px" @opened="onDialogOpen">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="影像分类" prop="videoType">
            <el-select v-model="form.videoType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.report_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="缩略图">
            <!-- <el-input v-model="form.thumbnail" style="width: 370px;" /> -->
            <!--上传图片-->
            <img ref="thumbnail" :src="form.thumbnail ? baseApi + '/file/images/' + form.thumbnail : Avatar" title="点击上传缩略图" class="avatar" @click="toggleShow">
            <myUpload
              v-model="show"
              field="file"
              :headers="headers"
              :width="676"
              :height="374"
              :url="imagesUploadApi"
              :no-circle="true"
              :no-square="true"
              @crop-upload-success="cropUploadSuccess"
            />
            <label class="el-form-item-label">※图片尺寸要求：676 x 374</label>
          </el-form-item>
          <el-form-item v-if="crud.status.add" label="影像文件">
            <!-- <el-input v-model="form.videoFile" style="width: 370px;" /> -->
            <!-- <el-upload
              ref="upload"
              :limit="1"
              :before-upload="beforeUpload"
              :auto-upload="false"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :action="'/api/video?name='+ this.form.title +'&title='+ this.form.title + '&videoType=' + this.form.videoType"
            > -->
            <el-upload
              ref="upload"
              :limit="1"
              action="no"
              :http-request="handleUpload"
              :before-upload="beforeUpload"
              :auto-upload="false"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
            >
              <div class="eladmin-upload"><i class="el-icon-upload" /> 添加文件</div>
              <div slot="tip" class="el-upload__tip">请上传视频格式文件，且不超过500M</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="外部链接URL" prop="linkUrl">
            <el-input ref="linkUrl" v-model="form.linkUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="排序" prop="sortNum">
            <el-input v-model="form.sortNum" type="number" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="影像描述" />
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
          <!-- <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button> -->
          <el-button v-if="crud.status.add" :loading="loading" type="primary" @click="upload">确认</el-button>
          <el-button v-else :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="videoId" label="影像ID" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="videoType" label="影像分类">
          <template slot-scope="scope">
            {{ dict.label.report_type[scope.row.videoType] }}
          </template>
        </el-table-column>
        <el-table-column prop="sortNum" label="排序" />
        <el-table-column prop="linkUrl" label="外链Url" />
        <el-table-column prop="path" label="预览图">
          <template slot-scope="{row}">
            <el-image
              :src="row.thumbnail=='null'?'':baseApi + '/file/images/' + row.thumbnail"
              :preview-src-list="[row.thumbnail=='null'?'':baseApi + '/file/images/' + row.thumbnail]"
              fit="contain"
              lazy
              class="avatar-small"
            >
              <div slot="error">
                <i class="el-icon-document" />
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','video:edit','video:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
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
import crudTVideo from '@/api/fenghui/video'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

import myUpload from 'vue-image-crop-upload'
import { upload } from '@/utils/upload'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'
import Avatar from '@/assets/images/noimage.jpg'
import E from 'wangeditor'
let image = ''
const defaultForm = { videoId: null, title: null, videoType: 0, videoFile: null, thumbnail: null, content: '', linkUrl: '', sortNum: 99, searchType: 3, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'Video',
  components: { pagination, crudOperation, rrOperation, udOperation, myUpload },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['report_type'],
  cruds() {
    return CRUD({ title: '峰会影像', url: 'api/video', idField: 'videoId', sort: 'videoId,desc', crudMethod: { ...crudTVideo }})
  },
  data() {
    return {
      show: false,
      Avatar: Avatar,
      delAllLoading: false,
      loading: false,
      editorContent: '',
      height: document.documentElement.clientHeight - 200 + 'px',
      permission: {
        add: ['admin', 'video:add'],
        edit: ['admin', 'video:edit'],
        del: ['admin', 'video:del']
      },
      headers: { 'Authorization': getToken() },
      uploadFile: undefined,
      editor: undefined,
      formData: undefined,
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        videoType: [
          { required: true, message: '影像分类不能为空', trigger: 'blur' }
        ],
        linkUrl: [
          { min: 0, max: 500, message: '长度在 500 个字符以内', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'title', display_name: '标题' },
        { key: 'videoType', display_name: '影像分类' }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'baseApi',
      'imagesUploadApi',
      'videosUploadApi',
      'fileUploadApi'
    ])
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 上传文件
    upload() {
      // uploadData.title = this.form.title
      // uploadData.videoType = this.form.videoType

      console.info(this.$refs.upload)
      console.info(this.$refs.linkUrl)
      if (this.$refs.upload.uploadFiles.length === 0) {
        if (this.$refs.linkUrl.value.length > 0) {
          this.crud.submitCU()
          return
        }
        this.$message.error('请选择影像文件或设置外链Url!')
        return
      }
      this.$refs.upload.submit()
    },
    beforeUpload(file) {
      let isLt2M = true
      isLt2M = file.size / 1024 / 1024 < 500
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件大小不能超过 500MB!')
      }
      this.form.name = file.name
      this.uploadFile = file
      return isLt2M
    },
    handleUpload(file) {
      this.sumitForm(this.uploadFile)
    },
    sumitForm(file) {
      this.formData = new FormData()
      if (file != null) {
        this.formData.append('file', file)
      }
      this.formData.append('videoId', this.crud.getDataId(this.crud.form))
      this.formData.append('name', this.crud.form.name)
      this.formData.append('title', this.crud.form.title)
      this.formData.append('videoType', this.crud.form.videoType)
      this.formData.append('content', this.editorContent)
      this.formData.append('thumbnail', image)
      this.formData.append('rules', this.rules)
      this.formData.append('sortNum', this.crud.form.sortNum)
      this.formData.append('linkUrl', this.crud.form.linkUrl)
      // this.crud.form = this.formData
      // this.crud.form.rules = this.rules
      // this.crud.submitCU()

      if (this.crud.status.add === CRUD.STATUS.PREPARED) {
        this.crud.status.add = CRUD.STATUS.PROCESSING
        if (file == null) {
          console.info('外链提交!')
          this.crud.crudMethod.add(this.formData).then(() => {
            this.crud.status.add = CRUD.STATUS.NORMAL
            this.crud.resetForm()
            this.crud.addSuccessNotify()
            this.crud.toQuery()

            this.handleSuccess()
          }).catch(() => {
            this.crud.status.add = CRUD.STATUS.PREPARED
            // ncallVmHook(crud, CRUD.HOOK.afterAddError)
          })
        } else {
          this.crud.crudMethod.addFile(this.formData).then(() => {
            this.crud.status.add = CRUD.STATUS.NORMAL
            this.crud.resetForm()
            this.crud.addSuccessNotify()
            this.crud.toQuery()

            this.handleSuccess()
          }).catch(() => {
            this.crud.status.add = CRUD.STATUS.PREPARED
            // ncallVmHook(crud, CRUD.HOOK.afterAddError)
          })
        }
      }
    },
    handleSuccess() {
      console.info('提交成功')
      this.crud.notify('提交成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
      this.$refs.upload.clearFiles()
      this.editorContent = ''
      image = this.Avatar
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
      this.loading = false
    },
    [CRUD.HOOK.beforeToEdit](crud, form) {
      image = `${form.thumbnail}`
      form.videoType = `${form.videoType}`
      this.editorContent = `${form.content}`
      if (this.editor) {
        this.editor.txt.html(this.editorContent)
      }
      if (this.$refs.thumbnail) {
        if (!image) {
          this.$refs.thumbnail.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + image
        } else {
          this.$refs.thumbnail.src = Avatar
        }
      }
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      image = `${form.thumbnail}`
      form.videoType = `${form.videoType}`
      this.editorContent = `${form.content}`
      if (this.editor) {
        this.editor.txt.html(this.editorContent)
      }
      if (this.$refs.thumbnail) {
        if (!image) {
          this.$refs.thumbnail.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + image
        } else {
          this.$refs.thumbnail.src = Avatar
        }
      }
    },
    [CRUD.HOOK.afterValidateCU](crud) {
      crud.form.thumbnail = image
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
      // 文件上传
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

      this.editor.config.customUploadVideo = function(files, insert) {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法
        files.forEach(video => {
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
    },
    toggleShow() {
      this.show = !this.show
    },
    cropUploadSuccess(jsonData, field) {
      console.log(jsonData)
      this.$refs.thumbnail.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + jsonData.realName
      image = jsonData.realName
      store.dispatch('GetInfo').then(() => {})
    },
    imgAdd(pos, $file) {
      upload(this.imagesUploadApi, $file).then(res => {
        const data = res.data
        const url = this.baseApi + '/file/' + data.type + '/' + data.realName
        this.$refs.md.$img2Url(pos, url)
      })
    }
  }
}
</script>

<style scoped>
  .avatar {
    width: 676px;
    height: 374px;
    border-radius: 28px;
  }
  .text {
    text-align:left;
  }
 ::v-deep .w-e-text-container {
    height: 420px !important;
  }
  .avatar-small {
    width: 100px;
    height: 46px;
    border-radius: 10px;
  }
</style>
