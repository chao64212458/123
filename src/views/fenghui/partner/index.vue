<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">合作伙伴名称</label>
        <el-input v-model="query.partnerName" clearable placeholder="合作伙伴名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="合作伙伴名称" prop="partnerName">
            <el-input v-model="form.partnerName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="合作伙伴图标">
            <!-- <el-input v-model="form.partnerIcon" style="width: 370px;" /> -->
            <img ref="partnerIcon" :src="form.partnerIcon ? baseApi + '/file/images/' + form.partnerIcon : Avatar" title="点击上传图标" class="avatar" @click="toggleShow">
            <myUpload
              v-model="show"
              field="file"
              :headers="headers"
              :width="288"
              :height="123"
              :url="imagesUploadApi"
              :no-circle="true"
              :no-square="true"
              @crop-upload-success="cropUploadSuccess"
            />
            <label class="el-form-item-label">※图片尺寸要求：288 x 123</label>
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
        <el-table-column prop="partnerId" label="合作伙伴ID" />
        <el-table-column prop="partnerName" label="合作伙伴名称" />
        <el-table-column prop="sortNum" label="排序" />
        <el-table-column prop="path" label="预览图">
          <template slot-scope="{row}">
            <el-image
              :src=" baseApi + '/file/images/' + row.partnerIcon"
              :preview-src-list="[baseApi + '/file/images/' + row.partnerIcon]"
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
        <el-table-column v-if="checkPer(['admin','partner:edit','partner:del'])" label="操作" width="150px" align="center">
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
import crudTPartner from '@/api/fenghui/partner'
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
const defaultForm = { partnerId: null, partnerName: null, partnerIcon: null, sortNum: 99, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TPartner',
  components: { pagination, crudOperation, rrOperation, udOperation, myUpload },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '合作伙伴', url: 'api/partner', idField: 'partnerId', sort: 'partnerId,desc', crudMethod: { ...crudTPartner }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'partner:add'],
        edit: ['admin', 'partner:edit'],
        del: ['admin', 'partner:del']
      },
      show: false,
      Avatar: Avatar,
      headers: {
        'Authorization': getToken()
      },
      rules: {
        partnerName: [
          { required: true, message: '合作伙伴名称不能为空', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'partnerName', display_name: '合作伙伴名称' }
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
      iconFile = `${form.partnerIcon}`
      if (this.$refs.partnerIcon) {
        if (!iconFile) {
          this.$refs.partnerIcon.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + iconFile
        } else {
          this.$refs.partnerIcon.src = Avatar
        }
      }
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      iconFile = `${form.partnerIcon}`
      if (this.$refs.partnerIcon) {
        if (!iconFile) {
          this.$refs.partnerIcon.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + iconFile
        } else {
          this.$refs.partnerIcon.src = Avatar
        }
      }
    },
    [CRUD.HOOK.afterValidateCU](crud) {
      crud.form.partnerIcon = iconFile
    },
    toggleShow() {
      this.show = !this.show
    },
    cropUploadSuccess(jsonData, field) {
      this.$refs.partnerIcon.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + jsonData.realName
      iconFile = jsonData.realName
      store.dispatch('GetInfo').then(() => {})
    }
  }
}
</script>

<style scoped>
  .avatar {
    width: 288px;
    height: 123px;
    border-radius: 18px;
  }
  .avatar-small {
    width: 100px;
    height: 46px;
    border-radius: 10px;
  }
</style>
