<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">关键字</label>
        <el-input v-model="query.content" clearable placeholder="关键字" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="adviceId" label="建议ID" width="100" />
        <el-table-column prop="content" label="内容" />
        <!-- <el-table-column v-if="checkPer(['admin','advice:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column> -->
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudTAdvice from '@/api/osmc/advice'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
const defaultForm = { adviceId: null, content: null, createUser: null, createTime: null, updateUser: null, updateTime: null }
export default {
  name: 'TAdvice',
  components: { pagination, crudOperation, rrOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '反馈建议', url: 'api/osmc/advice', idField: 'adviceId', sort: 'adviceId,desc', optShow: { add: false, edit: false, del: true, reset: false, download: true }, crudMethod: { ...crudTAdvice }})
  },
  data() {
    return {
      permission: {
        del: ['admin', 'advice:del']
      },
      show: false,
      headers: {
        'Authorization': getToken()
      },
      queryTypeOptions: [
        { key: 'content', display_name: '关键字' }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'baseApi'
    ])
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    toggleShow() {
      this.show = !this.show
    }
  }
}
</script>

