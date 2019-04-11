const Nedb = require('nedb')
const roomStorage = new Nedb({ filename: './rooms.db', autoload: true })
roomStorage.persistence.setAutocompactionInterval(300 * 1000) // 每隔5分钟压缩一次数据库 防止文件过大 (https://github.com/louischatriot/nedb/issues/530)
module.exports = {
  /**
   * 保存数据库
   * @param {Object} data
   */
  save (data) {
    roomStorage.insert(data, (err, ret) => {
      if (err) {
        console.log('insert error', err)
      }
    })
  },
  /**
   * 查找数据库
   * @param {*} params
   */
  find (params) {
    return new Promise((resolve, reject) => {
      roomStorage.find(params || {}, (err, ret) => {
        if (!err) {
          resolve(ret)
        }
      })
    })
  },
  /**
   * 判断记录存在
   * @param {*} params
   */
  exist (params) {
    return new Promise((resolve, reject) => {
      roomStorage.findOne(params || {}, (err, ret) => {
        if (!err) {
          resolve(!!ret)
        }
      })
    })
  },
  /**
   * 查找一个
   * @param {*} params
   */
  findOne (params) {
    return new Promise((resolve, reject) => {
      roomStorage.findOne(params || {}, (err, ret) => {
        if (!err) {
          resolve(ret)
        }
      })
    })
  },
  /**
   * 更新记录
   * @param {*} query 条件
   * @param {*} data 更新的属性
   */
  update (query, data) {
    return new Promise((resolve, reject) => {
      roomStorage.update(query, {
        $set: data
      }, {}, (err, ret) => {
        if (!err) {
          resolve(ret)
        } else {
          reject(err)
        }
      })
    })
  }
}
