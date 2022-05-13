import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/article/nofile',
    method: 'post',
    data
  })
}

// axios代码 上传请求
export function addFile(param) {
  return request({
    url: 'api/article',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: param,
    responseType: 'blob'
  })
}

export function del(ids) {
  return request({
    url: 'api/article/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/article/nofile',
    method: 'put',
    data
  })
}

export default { add, edit, del, addFile }
