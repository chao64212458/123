<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">敏感词</label>
        <el-input v-model="query.wordName" clearable placeholder="敏感词" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="敏感词" prop="wordName">
            <el-input v-model="form.wordName" style="width: 370px;" />
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
        <el-table-column prop="wordId" label="敏感词ID" />
        <el-table-column prop="wordName" label="敏感词" />
        <el-table-column v-if="checkPer(['admin','ignoreword:edit','ignoreword:del'])" label="操作" width="150px" align="center">
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
import crudTIgnoreword from '@/api/osmc/ignoreword'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'

const defaultForm = { wordId: null, wordName: null, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TPartner',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '敏感词管理', url: 'api/osmc/ignoreword', idField: 'wordId', sort: 'wordId,desc', optShow: { add: true, edit: true, del: true, reset: false, download: false }, crudMethod: { ...crudTIgnoreword }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'ignoreword:add'],
        edit: ['admin', 'ignoreword:edit'],
        del: ['admin', 'ignoreword:del']
      },
      headers: {
        'Authorization': getToken()
      },
      rules: {
        wordName: [
          { required: true, message: '敏感词不能为空', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'wordName', display_name: '敏感词' }
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
    }
  }
}
</script>
