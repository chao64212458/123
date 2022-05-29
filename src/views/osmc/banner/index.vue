<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" size="small" label-width="80px">
          <el-form-item label="Banner">
            <img ref="bannerUrl" :src="form.partnerIcon ? baseApi + '/file/images/' + form.partnerIcon : Avatar" title="点击上传图片" class="avatar" @click="toggleShow">
            <myUpload
              v-model="show"
              field="file"
              :headers="headers"
              :width="300"
              :height="168"
              img-format="jpg"
              :url="imagesUploadApi"
              :no-circle="true"
              :no-square="true"
              @crop-upload-success="cropUploadSuccess"
            />
            <label class="el-form-item-label">※图片尺寸要求：300 x 168</label>
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
        <el-table-column prop="bannerId" label="BannerID" />
        <el-table-column prop="bannerName" label="Banner名称" />
        <el-table-column prop="bannerUrl" label="Banner图片">
          <template slot-scope="{row}">
            <el-image
              :src=" baseApi + '/file/images/' + row.bannerUrl"
              :preview-src-list="[baseApi + '/file/images/' + row.bannerUrl]"
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
        <el-table-column v-if="checkPer(['admin','banner:edit','banner:del'])" label="操作" width="150px" align="center">
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
import crudTBanner from '@/api/osmc/banner'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

import { mapGetters } from 'vuex'
import myUpload from 'vue-image-crop-upload'
import Avatar from '@/assets/images/noimage.jpg'
import store from '@/store'
import { getToken } from '@/utils/auth'
let iconFile = ''
const defaultForm = { bannerId: null, bannerName: null, bannerUrl: null, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TPartner',
  components: { pagination, udOperation, myUpload },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'Banner管理', url: 'api/osmc/banner', idField: 'bannerId', sort: 'bannerId,asc', optShow: { add: false, edit: true, del: false, reset: false, download: false }, crudMethod: { ...crudTBanner }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'banner:add'],
        edit: ['admin', 'banner:edit'],
        del: ['admin', 'banner:del']
      },
      show: false,
      Avatar: Avatar,
      headers: {
        'Authorization': getToken()
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
      iconFile = `${form.bannerUrl}`
      if (this.$refs.bannerUrl) {
        if (!iconFile) {
          this.$refs.bannerUrl.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + iconFile
        } else {
          this.$refs.bannerUrl.src = Avatar
        }
      }
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      iconFile = `${form.bannerUrl}`
      if (this.$refs.bannerUrl) {
        if (!iconFile) {
          this.$refs.bannerUrl.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + iconFile
        } else {
          this.$refs.bannerUrl.src = Avatar
        }
      }
    },
    [CRUD.HOOK.afterValidateCU](crud) {
      crud.form.bannerUrl = iconFile
    },
    toggleShow() {
      this.show = !this.show
    },
    cropUploadSuccess(jsonData, field) {
      this.$refs.bannerUrl.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + jsonData.realName
      iconFile = jsonData.realName
      store.dispatch('GetInfo').then(() => {})
    }
  }
}
</script>

<style scoped>
  .avatar {
    width: 300px;
    height: 168px;
    /* border-radius: 18px; */
  }
  .avatar-small {
    width: 100px;
    height: 46px;
    /* border-radius: 10px; */
  }
</style>
