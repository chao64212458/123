<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">设置类型</label>
        <el-input v-model="query.settingsSection" clearable placeholder="设置类型" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="设置类型" prop="settingsSection">
            <el-input v-model="form.settingsSection" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="设置KEY" prop="settingsKey">
            <el-input v-model="form.settingsKey" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="设置值" prop="settingsValue">
            <el-input v-model="form.settingsValue" style="width: 370px;" />
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
        <el-table-column prop="settingsId" label="设置ID" />
        <el-table-column prop="settingsSection" label="设置类型" />
        <el-table-column prop="settingsKey" label="设置KEY" />
        <el-table-column prop="settingsValue" label="设置值" />
        <el-table-column v-if="checkPer(['admin','settings:edit','settings:del'])" label="操作" width="150px" align="center">
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
import crudTSettings from '@/api/fenghui/settings'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { settingsId: null, settingsSection: null, settingsKey: null, settingsValue: null, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TSettings',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: 'settings', url: 'api/settings', idField: 'settingsId', sort: 'settingsId,desc', crudMethod: { ...crudTSettings }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'settings:add'],
        edit: ['admin', 'settings:edit'],
        del: ['admin', 'settings:del']
      },
      rules: {
        settingsSection: [
          { required: true, message: '设置类型不能为空', trigger: 'blur' }
        ],
        settingsKey: [
          { required: true, message: '设置KEY不能为空', trigger: 'blur' }
        ],
        settingsValue: [
          { required: true, message: '设置值不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'settingsSection', display_name: '设置类型' }
      ]
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
