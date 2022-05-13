<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">VR名称</label>
        <el-input v-model="query.vrName" clearable placeholder="VR名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="1620px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="VR名称" prop="vrName">
            <el-input v-model="form.vrName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="VR缩略图">
            <!-- <el-input v-model="form.vrIcon" style="width: 370px;" /> -->
            <img ref="vrIcon" :src="form.vrIcon ? baseApi + '/file/images/' + form.vrIcon : Avatar" title="点击上传缩略图" class="avatar" @click="toggleShow">
            <myUpload
              v-model="show"
              field="file"
              :headers="headers"
              :width="1500"
              :height="800"
              img-format="jpg"
              :url="imagesUploadApi"
              :no-circle="true"
              :no-square="true"
              @crop-upload-success="cropUploadSuccess"
            />
            <label class="el-form-item-label">※图片尺寸要求：1500 x 800</label>
          </el-form-item>
          <el-form-item label="链接URL" prop="linkUrl">
            <el-input v-model="form.linkUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="排序">
            <el-input v-model="form.sortNum" type="number" style="width: 370px;" />
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
        <el-table-column prop="vrId" label="VRID" />
        <el-table-column prop="vrName" label="VR名称" />
        <el-table-column prop="sortNum" label="排序" />
        <el-table-column prop="path" label="缩略图">
          <template slot-scope="{row}">
            <el-image
              :src=" baseApi + '/file/images/' + row.vrIcon"
              :preview-src-list="[baseApi + '/file/images/' + row.vrIcon]"
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
        <el-table-column v-if="checkPer(['admin','vr:edit','vr:del'])" label="操作" width="150px" align="center">
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
import crudTVr from '@/api/osmc/vr'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

import { mapGetters } from 'vuex'
import myUpload from 'vue-image-crop-upload'
import Avatar from '@/assets/images/noimage.jpg'
import store from '@/store'
import { getToken } from '@/utils/auth'
let iconFile = ''
const defaultForm = { vrId: null, vrName: null, vrIcon: null, linkUrl: null, sortNum: 99, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TVr',
  components: { pagination, crudOperation, rrOperation, udOperation, myUpload },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'VR', url: 'api/osmc/vr', idField: 'vrId', sort: ['sortNum,asc', 'vrId,desc'], optShow: { add: true, edit: true, del: true, reset: false, download: false }, crudMethod: { ...crudTVr }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'vr:add'],
        addFile: ['admin', 'vr:add'],
        edit: ['admin', 'vr:edit'],
        del: ['admin', 'vr:del']
      },
      loading: false,
      show: false,
      Avatar: Avatar,
      headers: {
        'Authorization': getToken()
      },
      rules: {
        vrName: [
          { required: true, message: 'VR名称不能为空', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'vrName', display_name: 'VR名称' }
      ]
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
      iconFile = `${form.vrIcon}`
      if (this.$refs.vrIcon) {
        if (!iconFile) {
          this.$refs.vrIcon.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + iconFile
        } else {
          this.$refs.vrIcon.src = Avatar
        }
      }
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      iconFile = `${form.vrIcon}`
      if (this.$refs.vrIcon) {
        if (!iconFile) {
          this.$refs.vrIcon.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + iconFile
        } else {
          this.$refs.vrIcon.src = Avatar
        }
      }
    },
    [CRUD.HOOK.afterValidateCU](crud) {
      crud.form.vrIcon = iconFile
      crud.form.vrType = 17
    },
    toggleShow() {
      this.show = !this.show
    },
    cropUploadSuccess(jsonData, field) {
      this.$refs.vrIcon.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + jsonData.realName
      iconFile = jsonData.realName
      store.dispatch('GetInfo').then(() => {})
    }
  }
}
</script>

<style scoped>
  .avatar {
    width: 1500px;
    height: 800px;
    /* border-radius: 18px; */
  }
  .avatar-small {
    width: 100px;
    height: 46px;
    /* border-radius: 10px; */
  }
</style>
