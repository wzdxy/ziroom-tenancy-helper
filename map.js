const superAgent = require('superagent')
const config = require('./config')
const _ = require("lodash")
module.exports = {
  /**
   * 获取两地之间的路线
   * @param {*} origin
   * @param {*} dest
   */
  async getPath (origin, dest, type, option) {
    if (!option) {
      option = {}
    }
    return new Promise((resolve, reject) => {
      if (!config.ak) {
        reject(Error({
          status: -1,
          message: '请求未发出 , 因为未配置 config.ak'
        }))
      }
      superAgent.get('http://api.map.baidu.com/direction/v2/' + type)
        .query(Object.assign({
          origin: origin,
          destination: dest,
          ak: config.ak
        }, option))
        .end((err, res) => {
          err && reject(err)
          if (res.text) {
            resolve(JSON.parse(res.text))
          } else {
            reject('返回JSON解析错误')
          }
        })
    })
  },
  // 根据偏好获取多组公交换乘路线
  async getTransitPathGroup (origin, dest) {
    let group = [0, 1, 4, 5]  // 路线偏好 0 推荐 1 少换乘 2 少步行 3 不坐地铁 4 时间短 5 地铁优先
    let result = []
    return new Promise(async (resolve, reject) => {
      for (let i =0; i< group.length; i++) {
        try {
          let path = await this.getPath(origin, dest, 'transit', {
            tactics_incity: group[i]
          })
          if (path.status === 0 && path.result.total > 0) { // 每个偏好会返回多条路线, 取第一个
            result.push(path.result.routes[0])
          }
        } catch (error) {
          console.error(error)
          continue
        }
      }
      resolve(_.uniqWith(result, (a, b) => a.duration === b.duration && a.distence === b.distence)) // 不同偏好可能返回相同路线,需去重
    })
  },

  // 获取推荐的公交换乘路线
  async getRecommendTransitPathGroup (origin, dest) {
    let group = [0, 1, 4, 5]  // 路线偏好 0 推荐 1 少换乘 2 少步行 3 不坐地铁 4 时间短 5 地铁优先
    let result = []
    return new Promise(async (resolve, reject) => {
      try {
        let path = await this.getPath(origin, dest, 'transit')
        if (path.status === 0 && path.result.routes.length > 0) { // 如果有路线 , 取第一个
          resolve(path.result.routes)
        } else {
          resolve(false)
        }
      } catch(error) {
        console.error('获取公交路线错误', error)
        reject(error)
      }
    })
  },

  // 获取骑行路线
  async getRidingPath (origin, dest) {
    return new Promise(async (resolve, reject) => {
      try {
        let path = await this.getPath(origin, dest, 'riding')
        if (path.status === 0 && path.result.routes.length > 0) { // 如果有路线 , 取第一个
          resolve(path.result.routes[0])
        } else {
          resolve(false)
        }
      } catch (error) {
        console.error('获取骑行路线错误', error)
        reject(error)
      }
    })
  }

}
