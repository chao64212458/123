import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/material/nofile',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/material/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/material',
    method: 'put',
    data
  })
}

// axios代码 上传请求
export function addFile(param) {
  return request({
    url: 'api/material',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: param,
    responseType: 'blob'
  })
}

export default { add, edit, del, addFile }
