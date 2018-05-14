const Nedb = require('nedb')
const roomStorage = new Nedb({ filename: './rooms.db', autoload: true })
module.exports = {
  /**
   * 保存数据库
   * @param {Object} data
   */
  save (data) {
    roomStorage.insert(data, (err, ret) => {
      if (!err) {
        console.log(ret)
      }
    })
  },
  find (params) {
    return new Promise((resolve, reject) => {
      roomStorage.find(params || {}, (err, ret) => {
        if (!err) {
          resolve(ret)
        }
      })
    })
  },
  exist (params) {
    return new Promise((resolve, reject) => {
      roomStorage.findOne(params || {}, (err, ret) => {
        if (!err) {
          resolve(!!ret)
        }
      })
    })
  },
  findOne (params) {
    return new Promise((resolve, reject) => {
      roomStorage.findOne(params || {}, (err, ret) => {
        if (!err) {
          resolve(ret)
        }
      })
    })
  },
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
