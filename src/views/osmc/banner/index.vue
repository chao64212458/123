<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="700px">
        <el-form ref="form" :model="form" size="small" label-width="100px">
          <el-form-item label="Banner名称" prop="tips">
            <el-input v-model="form.bannerName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="首页推荐">
            <el-radio v-for="item in dict.article_top_type" :key="item.id" v-model="form.topFlg" :label="item.value">{{ item.label }}</el-radio>
          </el-form-item>
          <el-form-item label="排序">
            <el-input v-model="form.sortNum" type="number" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="Banner图层1">
            <img ref="banner1Url" :src="form.banner1Url ? baseApi + '/file/images/' + form.banner1Url : Avatar" title="点击上传图片" class="avatar" @click="toggle1Show">
            <myUpload
              v-model="banner1show"
              field="file"
              :headers="headers"
              :width="1920"
              :height="956"
              img-format="jpg"
              :url="imagesUploadApi"
              :no-circle="true"
              :no-square="true"
              @crop-upload-success="crop1UploadSuccess"
            />
            <label class="el-form-item-label">※图片尺寸要求：1920 x 956</label>
          </el-form-item>
          <el-form-item label="Banner图层2">
            <img ref="banner2Url" :src="form.banner2Url ? baseApi + '/file/images/' + form.banner2Url : Avatar" title="点击上传图片" class="avatar" @click="toggle2Show">
            <myUpload
              v-model="banner2show"
              field="file"
              :headers="headers"
              :width="1920"
              :height="956"
              img-format="png"
              :url="imagesUploadApi"
              :no-circle="true"
              :no-square="true"
              @crop-upload-success="crop2UploadSuccess"
            />
            <label class="el-form-item-label">※图片尺寸要求：1920 x 956</label>
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
        <el-table-column prop="topFlg" label="首页推荐">
          <template slot-scope="scope">
            {{ dict.label.article_top_type[scope.row.topFlg] }}
          </template>
        </el-table-column>
        <el-table-column prop="sortNum" label="排序" />
        <el-table-column prop="banner1Url" label="Banner图层1">
          <template slot-scope="{row}">
            <el-image
              :src=" baseApi + '/file/images/' + row.banner1Url"
              :preview-src-list="[baseApi + '/file/images/' + row.banner1Url]"
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
        <el-table-column prop="banner2Url" label="Banner图层2">
          <template slot-scope="{row}">
            <el-image
              :src=" baseApi + '/file/images/' + row.banner2Url"
              :preview-src-list="[baseApi + '/file/images/' + row.banner2Url]"
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
import crudOperation from '@crud/CRUD.operation'
import { mapGetters } from 'vuex'
import myUpload from 'vue-image-crop-upload'
import Avatar from '@/assets/images/noimage.jpg'
import store from '@/store'
import { getToken } from '@/utils/auth'
let icon1File = ''
let icon2File = ''
const defaultForm = { bannerId: null, bannerName: null, banner1Url: null, banner2Url: null, topFlg: 0, sortNum: 999, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TBanner',
  components: { pagination, udOperation, crudOperation, myUpload },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['article_top_type'],
  cruds() {
    return CRUD({ title: 'Banner管理', url: 'api/osmc/banner', idField: 'bannerId', sort: ['sortNum,asc', 'bannerId,asc'], optShow: { add: true, edit: true, del: true, reset: false, download: false }, crudMethod: { ...crudTBanner }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'banner:add'],
        edit: ['admin', 'banner:edit'],
        del: ['admin', 'banner:del']
      },
      banner1show: false,
      banner2show: false,
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
      form.topFlg = `${form.topFlg}`
      icon1File = `${form.banner1Url}`
      if (this.$refs.banner1Url) {
        if (!icon1File) {
          this.$refs.banner1Url.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + icon1File
        } else {
          this.$refs.banner1Url.src = Avatar
        }
      }
      icon2File = `${form.banner2Url}`
      if (this.$refs.banner2Url) {
        if (!icon1File) {
          this.$refs.banner2Url.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + icon2File
        } else {
          this.$refs.banner2Url.src = Avatar
        }
      }
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      form.topFlg = `${form.topFlg}`
      icon1File = `${form.banner1Url}`
      if (this.$refs.banner1Url) {
        if (!icon1File) {
          this.$refs.banner1Url.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + icon1File
        } else {
          this.$refs.banner1Url.src = Avatar
        }
      }
      icon2File = `${form.banner2Url}`
      if (this.$refs.banner2Url) {
        if (!icon1File) {
          this.$refs.banner2Url.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + icon2File
        } else {
          this.$refs.banner2Url.src = Avatar
        }
      }
    },
    [CRUD.HOOK.afterValidateCU](crud) {
      crud.form.banner1Url = icon1File
      crud.form.banner2Url = icon2File
    },
    toggle1Show() {
      this.banner1show = !this.banner1show
    },
    toggle2Show() {
      this.banner2show = !this.banner2show
    },
    crop1UploadSuccess(jsonData, field) {
      this.$refs.banner1Url.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + jsonData.realName
      icon1File = jsonData.realName
      store.dispatch('GetInfo').then(() => {})
    },
    crop2UploadSuccess(jsonData, field) {
      this.$refs.banner2Url.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + jsonData.realName
      icon2File = jsonData.realName
      store.dispatch('GetInfo').then(() => {})
    }
  }
}
</script>

<style scoped>
  .avatar {
    width: 480px;
    height: 239px;
    /* border-radius: 18px; */
  }
  .avatar-small {
    width: 100px;
    height: 46px;
    /* border-radius: 10px; */
  }
</style>
