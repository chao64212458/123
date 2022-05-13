<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <!-- <crudOperation :permission="permission" /> -->
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="二维码地址">
            <!-- <el-input v-model="form.qrcode" style="width: 370px;" /> -->
            <img ref="qrcode" :src="form.qrcode ? baseApi + '/file/images/' + form.qrcode : Avatar" title="点击上传二维码" class="avatar" @click="toggleShow">
            <myUpload
              v-model="show"
              field="file"
              :width="134"
              :height="134"
              :headers="headers"
              :url="imagesUploadApi"
              :no-circle="true"
              :no-square="true"
              @crop-upload-success="cropUploadSuccess"
            />
            <label class="el-form-item-label">※图片尺寸要求：134 x 134</label>
          </el-form-item>
          <el-form-item label="开关">
            <el-radio v-for="item in dict.article_top_type" :key="item.id" v-model="form.open" :label="item.value">{{ item.label }}</el-radio>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="qrId" label="ID" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="path" label="二维码">
          <template slot-scope="{row}">
            <el-image
              :src=" baseApi + '/file/images/' + row.qrcode"
              :preview-src-list="[baseApi + '/file/images/' + row.qrcode]"
              fit="contain"
              lazy
              class="avatar"
            >
              <div slot="error">
                <i class="el-icon-document" />
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="open" label="开关">
          <template slot-scope="scope">
            {{ dict.label.article_top_type[scope.row.open] }}
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','qrcode:edit','qrcode:del'])" label="操作" width="150px" align="center">
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
import myUpload from 'vue-image-crop-upload'
import Avatar from '@/assets/images/noimage.jpg'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'
import crudTQrcode from '@/api/fenghui/qrcode'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
let image = ''
const defaultForm = { qrId: null, title: null, qrcode: null, open: 0, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TQrcode',
  components: { pagination, udOperation, myUpload },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['article_top_type'],
  cruds() {
    return CRUD({ title: '二维码管理', url: 'api/qrcode', idField: 'qrId', sort: 'qrId,desc', crudMethod: { ...crudTQrcode }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'qrcode:add'],
        edit: ['admin', 'qrcode:edit'],
        del: ['admin', 'qrcode:del']
      },
      show: false,
      Avatar: Avatar,
      headers: {
        'Authorization': getToken()
      },
      height: document.documentElement.clientHeight - 180 + 'px;',
      rules: {
        title: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'imagesUploadApi',
      'baseApi'
    ])
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.beforeToEdit](crud, form) {
      image = `${form.qrcode}`
      form.open = `${form.open}`
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      image = `${form.qrcode}`
    },
    [CRUD.HOOK.afterValidateCU](crud) {
      crud.form.qrcode = image
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
      this.$refs.qrcode.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + jsonData.realName
      image = jsonData.realName
      store.dispatch('GetInfo').then(() => {})
    }
  }
}
</script>

<style scoped>
  .avatar {
    width: 134px;
    height: 134px;
    border-radius: 0px;
  }
</style>
