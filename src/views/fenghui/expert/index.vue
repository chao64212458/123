<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">姓名</label>
        <el-input v-model="query.expertName" clearable placeholder="姓名" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">姓名（英文）</label>
        <el-input v-model="query.expertEnName" clearable placeholder="姓名（英文）" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">公司</label>
        <el-input v-model="query.expertCompany" clearable placeholder="公司" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <label class="el-form-item-label">地域</label>
        <el-select v-model="query.expertType" clearable placeholder="请选择" class="filter-item" @keyup.enter.native="crud.toQuery">
          <el-option
            v-for="item in dict.expert_type"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <label class="el-form-item-label">区分</label>
        <el-select v-model="query.expertTitle" clearable placeholder="请选择" class="filter-item" @keyup.enter.native="crud.toQuery">
          <el-option
            v-for="item in dict.expert_title_type"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <label class="el-form-item-label">首页推荐</label>
        <el-select v-model="query.topFlg" clearable placeholder="请选择" class="filter-item" @keyup.enter.native="crud.toQuery">
          <el-option
            v-for="item in dict.article_top_type"
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
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="800px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="姓名" prop="expertName">
            <el-input v-model="form.expertName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="姓名（英文）" prop="expertEnName">
            <el-input v-model="form.expertEnName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="公司" prop="expertCompany">
            <el-input v-model="form.expertCompany" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="地域" prop="expertType">
            <el-select v-model="form.expertType" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.expert_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="职位" prop="expertPosition">
            <el-input v-model="form.expertPosition" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="区分" prop="expertTitle">
            <el-select v-model="form.expertTitle" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.expert_title_type"
                :key="item.id"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="首页推荐">
            <el-radio v-for="item in dict.article_top_type" :key="item.id" v-model="form.topFlg" :label="item.value">{{ item.label }}</el-radio>
          </el-form-item>
          <el-form-item label="描述" prop="expertDetail">
            <el-input v-model="form.expertDetail" :rows="5" type="textarea" style="width: 500px;" />
          </el-form-item>
          <el-form-item label="画像">
            <!-- <el-input v-model="form.expertPhoto" style="width: 370px;" /> -->
            <img ref="expertPhoto" :src="form.expertPhoto ? baseApi + '/file/images/' + form.expertPhoto : Avatar" title="点击上传画像" class="avatar" @click="toggleShow">
            <myUpload
              v-model="show"
              field="file"
              :width="174"
              :height="174"
              :headers="headers"
              :url="imagesUploadApi"
              @crop-upload-success="cropUploadSuccess"
            />
            <label class="el-form-item-label">※图片尺寸要求：174 x 174</label>
          </el-form-item>
          <el-form-item label="排序" prop="sortNum">
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
        <el-table-column prop="expertId" label="专家ID" />
        <el-table-column prop="expertName" label="姓名" />
        <el-table-column prop="expertEnName" label="姓名（英文）" />
        <el-table-column prop="topFlg" label="首页推荐">
          <template slot-scope="scope">
            {{ dict.label.article_top_type[scope.row.topFlg] }}
          </template>
        </el-table-column>
        <el-table-column prop="expertCompany" label="公司" />
        <el-table-column prop="expertType" label="地域">
          <template slot-scope="scope">
            {{ dict.label.expert_type[scope.row.expertType] }}
          </template>
        </el-table-column>
        <el-table-column prop="expertTitle" label="区分">
          <template slot-scope="scope">
            {{ dict.label.expert_title_type[scope.row.expertTitle] }}
          </template>
        </el-table-column>
        <el-table-column prop="expertPosition" label="职位" />
        <el-table-column prop="expertDetail" label="描述" />
        <el-table-column prop="sortNum" label="排序" />
        <el-table-column prop="path" label="预览图">
          <template slot-scope="{row}">
            <el-image
              :src=" baseApi + '/file/images/' + row.expertPhoto"
              :preview-src-list="[baseApi + '/file/images/' + row.expertPhoto]"
              fit="contain"
              lazy
              class="el-avatar"
            >
              <div slot="error">
                <i class="el-icon-document" />
              </div>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','expert:edit','expert:del'])" label="操作" width="150px" align="center">
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
import crudTExpert from '@/api/fenghui/expert'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

import { mapGetters } from 'vuex'
import myUpload from 'vue-image-crop-upload'
import Avatar from '@/assets/images/avatar.png'
import store from '@/store'
import { getToken } from '@/utils/auth'
let photoFile = ''
const defaultForm = { expertId: null, expertName: null, expertEnName: null, expertTitle: 1, expertCompany: null, expertType: 0, expertPosition: '', expertDetail: null, expertPhoto: null, sortNum: 99, topFlg: 0, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TExpert',
  components: { pagination, crudOperation, rrOperation, udOperation, myUpload },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['expert_type', 'expert_title_type', 'article_top_type'],
  cruds() {
    return CRUD({ title: '嘉宾', url: 'api/expert', idField: 'expertId', sort: 'expertId,desc', crudMethod: { ...crudTExpert }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'expert:add'],
        edit: ['admin', 'expert:edit'],
        del: ['admin', 'expert:del']
      },
      show: false,
      Avatar: Avatar,
      headers: {
        'Authorization': getToken()
      },
      height: document.documentElement.clientHeight - 180 + 'px;',
      rules: {
        expertName: [
          { required: true, message: '姓名不能为空', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        expertEnName: [
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        expertCompany: [
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        expertPosition: [
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        expertDetail: [
          { min: 2, max: 5000, message: '长度在 2 到 5000 个字符', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'expertName', display_name: '姓名' },
        { key: 'expertEnName', display_name: '姓名（英文）' },
        { key: 'expertCompany', display_name: '公司' },
        { key: 'expertType', display_name: '地域' },
        { key: 'topFlg', display_name: '首页推荐' }
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
      photoFile = `${form.expertPhoto}`
      form.expertType = `${form.expertType}`
      form.topFlg = `${form.topFlg}`
      form.expertTitle = `${form.expertTitle}`
      if (this.$refs.expertPhoto) {
        if (!photoFile) {
          this.$refs.expertPhoto.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + photoFile
        } else {
          this.$refs.expertPhoto.src = Avatar
        }
      }
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      photoFile = `${form.expertPhoto}`
      form.expertType = `${form.expertType}`
      form.topFlg = `${form.topFlg}`
      form.expertTitle = `${form.expertTitle}`
      if (this.$refs.expertPhoto) {
        if (!photoFile) {
          this.$refs.expertPhoto.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + photoFile
        } else {
          this.$refs.expertPhoto.src = Avatar
        }
      }
    },
    [CRUD.HOOK.afterValidateCU](crud) {
      crud.form.expertPhoto = photoFile
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
      this.$refs.expertPhoto.src = process.env.VUE_APP_BASE_API === '/' ? '' : process.env.VUE_APP_BASE_API + '/file/images/' + jsonData.realName
      photoFile = jsonData.realName
      store.dispatch('GetInfo').then(() => {})
    }
  }
}
</script>

<style scoped>
  .avatar {
    width: 174px;
    height: 174px;
    border-radius: 50%;
  }
</style>
