<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="600px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="友情链接名称" prop="linkName">
            <el-input v-model="form.linkName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="友情链接URL" prop="linkUrl">
            <el-input v-model="form.linkUrl" style="width: 370px;" />
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
        <el-table-column prop="linkId" label="友情链接ID" />
        <el-table-column prop="linkName" label="友情链接名称" />
        <el-table-column prop="linkUrl" label="友情链接URL" />
        <el-table-column prop="sortNum" label="排序" />
        <el-table-column v-if="checkPer(['admin','link:edit','link:del'])" label="操作" width="150px" align="center">
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
import crudTLink from '@/api/fenghui/link'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { linkId: null, linkName: null, linkUrl: null, sortNum: 99, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TLink',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '友情链接', url: 'api/link', idField: 'linkId', sort: 'linkId,desc', crudMethod: { ...crudTLink }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'link:add'],
        edit: ['admin', 'link:edit'],
        del: ['admin', 'link:del']
      },
      rules: {
        linkName: [
          { required: true, message: '友情链接名称不能为空', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        linkUrl: [
          { required: true, message: '友情链接URL不能为空', trigger: 'blur' },
          { min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
