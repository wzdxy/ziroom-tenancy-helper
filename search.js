const superAgent = require('superagent')
const config = require('./config')
const db = require('./db')
const map = require('./map')
module.exports = {
  /**
   * 爬取一页
   * @param {*} options
   * @param {*} page
   */
  async getList (options, page) {
    return new Promise((resolve, reject) => {
      superAgent.get('http://m.ziroom.com/v7/room/list.json')
        .query(Object.assign({
          page: page,
          city_code: 110000
        }, options))
        .end((err, res) => {
          if (err) reject(err)
          resolve(JSON.parse(res.text))
        })
    })
  },
  /**
   * 搜索搜多个页
   */
  loop (cycle) {
    return new Promise(async (resolve, reject) => {
      let result = []
      // 从第一页开始遍历
      let page = 1
      while (page <= config.maxPage) {
        let res = await this.getList(config.searchFilter, page)
        console.log(new Date(), page, res.data)
        if (res.error_code === 0) {
          if (res.data.rooms.length === 0) {
            console.log(new Date(), '爬取完成')
            resolve(result)
          } else {
            page++
          }
          res.data.rooms.forEach(async (item, idx) => {
            const exist = await db.findOne({ id: item.id })
            // 如果已经存在, 更新数据
            if (exist) {
              delete exist.firstUpdateTime
              delete exist.lastUpdateTime
              delete exist.path
              delete exist._id
              // 如果有更新才存入
              if (!this.match(exist, item)) {
                item.lastUpdateTime = new Date().getTime()
                await db.update({
                  id: item.id
                }, item)
              }
            } else {
              // 如果是新数据 , 存入数据库
              res.data.rooms[idx].firstUpdateTime = res.data.rooms[idx].lastUpdateTime = new Date().getTime()
              const path = await map.getPath(`${item.lat},${item.lng}`, config.originString)
              res.data.rooms[idx].path = JSON.parse(path.text)
              db.save(res.data.rooms[idx])
            }
          })
          await this.sleep(this.getDurationRandom(config.avgDuration)) // 控制爬取频率
        } else {
          console.log('get list error', res.error_message)
        }
      }
      if (cycle) {
        await this.sleep(1000 * 60)
        await this.loop()
      }
    })
  },
  /**
   * 生成一个时间段
   * @param {Number} avg
   */
  getDurationRandom (avg) {
    let random = Math.random()
    if (random > 0.8 || random < 0.2) {
      return avg
    } else {
      return avg * 2 * random
    }
  },
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  /**
   * 比较两个对象是不是相同
   * @param {*} a
   * @param {*} b
   */
  match (a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
}
