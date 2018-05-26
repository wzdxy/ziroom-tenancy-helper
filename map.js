const superAgent = require('superagent')
const config = require('./config')
module.exports = {
  /**
   * 获取两地之间的路线 (骑行)
   * @param {*} origin
   * @param {*} dest
   */
  async getPath (origin, dest) {
    return new Promise((resolve, reject) => {
      if (!config.ak) {
        reject(Error({
          status: -1,
          message: '请求未发出 , 因为未配置 config.ak'
        }))
      }
      superAgent.get('http://api.map.baidu.com/direction/v2/riding')
        .query({
          origin: origin,
          destination: dest,
          ak: config.ak
        })
        .end((err, res) => {
          if (err) reject(err)
          resolve(res)
        })
    })
  }
}
