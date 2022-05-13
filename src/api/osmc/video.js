import request from '@/utils/request'

// export function add(data) {
//   return request({
//     url: 'api/video',
//     method: 'post',
//     data
//   })
// }

export function del(ids) {
  return request({
    url: 'api/osmc/video/',
    method: 'delete',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/osmc/video',
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// axios代码 上传请求
export function add(data) {
  return request({
    url: 'api/osmc/video/nofile',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data
  })
}

// axios代码 上传请求
export function addFile(param) {
  return request({
    url: 'api/video',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: param,
    responseType: 'blob'
  })
}

// export function edit(param) {
//   return request({
//     url: 'api/video',
//     method: 'put',
//     headers: {
//       'Content-Type': 'multipart/form-data'
//     },
//     data: param,
//     responseType: 'blob'
//   })
// }

export default { add, edit, del, addFile }
