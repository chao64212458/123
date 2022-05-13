import request from '@/utils/request'

export function getMenusTree(pid) {
  return request({
    url: 'api/osmc/menus/lazy?pid=' + pid,
    method: 'get'
  })
}

export function getMenus(params) {
  return request({
    url: 'api/osmc/menus',
    method: 'get',
    params
  })
}

export function getMenuSuperior(ids) {
  const data = ids.length || ids.length === 0 ? ids : Array.of(ids)
  return request({
    url: 'api/osmc/menus/superior',
    method: 'post',
    data
  })
}

export function getChild(id) {
  return request({
    url: 'api/osmc/menus/child?id=' + id,
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'api/osmc/menus',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/osmc/menus',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/osmc/menus',
    method: 'put',
    data
  })
}

export default { add, edit, del, getMenusTree, getMenuSuperior, getMenus, getChild }
