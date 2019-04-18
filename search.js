const superAgent = require('superagent')
require('colors')
const config = require('./config')
const db = require('./db')
const map = require('./map')
const price = require('./price')
let keywordIndex = 0
module.exports = {
  /**
   * 爬取一页
   * @param {*} options
   * @param {*} page
   */
  async getList (options, page) {
    const params = Object.assign({
      page: page,
      city_code: 110000
    }, options)
    return new Promise((resolve, reject) => {
      superAgent.get('http://m.ziroom.com/v7/room/list.json')
        .set('Accept', 'application/json;version=6')
        .query(params)
        .end((err, res) => {
          if (err) reject(err)
          resolve(JSON.parse(res.text))
        })
    })
  },
  /**
   * 请求详情页接口
   * @param {string} id
   */
  async getRoomDetail (id) {
    const params = Object.assign({
      city_code: 110000,
      id: id
    })
    return new Promise((resolve, reject) => {
      superAgent.get('http://m.ziroom.com/wap/detail/room.json')
        .set('Accept', 'application/json;version=6')
        .query(params)
        .end((err, res) => {
          if (err) reject(err)
          resolve(JSON.parse(res.text))
        })
    })
  },
  /**
   * 搜索搜多个页
   */
  loop (cycle, keyword) {
    return new Promise(async (resolve, reject) => {
      let result = []
      // 关键词
      config.searchFilter.keywords = config.keywordsArray[keywordIndex]
      console.log('开始搜索关键词'.green, config.searchFilter.keywords.yellow)
      // 从第一页开始遍历, 终止条件是配置文件的最大页码
      let page = 1
      while (page <= config.maxPage) {
        let res = await this.getList(config.searchFilter, page)
        console.log(`${new Date().toLocaleTimeString()} ${keyword.yellow} 第 ${page} 页 返回房源数量 ${res.data.rooms.length}`)
        if (res.error_code === 0) {
          if (!res.data.rooms || res.data.rooms.length === 0) {
            // 如果本页没有房源了, 本个关键词爬取完成
            console.log(new Date(), config.searchFilter.keywords + ' 爬取完成')
            if (keywordIndex < config.keywordsArray.length - 1) {
              // 如果还有其他关键词, 就开始下一个关键词的爬取
              await this.loop(cycle, config.keywordsArray[++keywordIndex])
            } else if (cycle) {
              // 从第一个关键词开始爬
              await this.sleep(1000 * 5)
              keywordIndex = 0
              await this.loop(cycle, config.keywordsArray[0])
              break
            } else {
              resolve(result)
            }
          } else {
            // 如果本关键词还没结束, 先页码++ , 然后开始处理本页数据
            page++
          }
          // 循环每个房源
          let countNew = 0
          let countUpdate = 0
          let countOld = 0
          let isPicUpdate = false
          for (let idx in res.data.rooms) {
            const item = res.data.rooms[idx]
            const exist = await db.findOne({ id: item.id })
            // 如果已经存在, 更新数据
            if (exist) {
              delete exist.firstUpdateTime
              delete exist.lastUpdateTime
              delete exist.path
              delete exist._id
              // 暂时去掉价格相关的数据, 比较其他数据
              const existPriceArray = exist.price
              const existPriceParsed = exist.priceParsed
              const newPriceArray = item.price
              delete item.price
              delete exist.price
              delete exist.priceParsed
              delete exist.hx_photos_big
              delete exist.hx_photos_min
              // 如果有更新才更新数据库字段
              if (!this.match(exist, item)) {
                item.lastUpdateTime = new Date().getTime()
                await db.update({
                  id: item.id
                }, item)
                countUpdate++
              } else if (!this.match(existPriceArray, newPriceArray)) {
                // 价格数据(图片或图片定位的数组)发生变化
                if (existPriceArray[0] !== newPriceArray[0]) {
                  isPicUpdate = true // 图片 URL 更新
                }
                item.price = newPriceArray
                item.priceParsed = await price.parsePrice(item.price[0], item.price[1]) // 重新解析价格
                if (item.priceParsed.price !== existPriceParsed.price) {
                  item.lastUpdateTime = new Date().getTime() // 如果实际价格也变化, 标记为数据更新
                } else {
                  countOld++
                }
                await db.update({
                  id: item.id
                }, item)
              } else {
                countOld++
              }
            } else {
              // 如果是新数据 , 存入数据库
              res.data.rooms[idx].firstUpdateTime = res.data.rooms[idx].lastUpdateTime = new Date().getTime()
              // 百度地图获取通勤路线
              if (config.ak) {
                const pathRide = await map.getPath(`${item.lat},${item.lng}`, config.originString, 'riding')
                res.data.rooms[idx].pathRide = JSON.parse(pathRide.text)
                const pathTransit = await map.getPath(`${item.lat},${item.lng}`, config.originString, 'transit', {
                  tactics_incity: 5
                })
                res.data.rooms[idx].pathTransit = JSON.parse(pathTransit.text)

              }
              // 图片识别
              res.data.rooms[idx].priceParsed = await price.parsePrice(res.data.rooms[idx].price[0], res.data.rooms[idx].price[1])
              // 获取户型图
              const roomDetail = await this.getRoomDetail(item.id)
              await this.sleep(500)
              res.data.rooms[idx].hx_photos_big = roomDetail.data.hx_photos_big
              res.data.rooms[idx].hx_photos_min = roomDetail.data.hx_photos_min
              db.save(res.data.rooms[idx])
              countNew++
            }
          }
          console.log(`         ${keyword.yellow} 第 ${page - 1} 页 新增 ${String(countNew).green}  更新 ${String(countUpdate).cyan}  未变化 ${String(countOld).gray}, 价格数字图片${isPicUpdate ? '有'.green : '无'.gray}变化`)
          await this.sleep(this.getDurationRandom(config.avgDuration)) // 控制爬取频率
        } else {
          console.log('get list error', res.error_message)
        }
      }
      if (keywordIndex < config.keywordsArray.length - 1) {
        await this.loop(cycle, config.keywordsArray[++keywordIndex])
      } else {
        keywordIndex = 0
        await this.loop(cycle, config.keywordsArray[0])
      }
    })
  },
  /**
   * 随机生成一个时间段
   * @param {Number} avg 平均值
   */
  getDurationRandom (avg) {
    let random = Math.random()
    if (random > 0.8 || random < 0.2) {
      return avg
    } else {
      return avg * 2 * random
    }
  },

  /**
   * 等待一段时间, 用于 async 方法
   * @param {Number} ms 时长
   */
  sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },
  /**
   * 比较两个对象是否相同
   * @param {*} a
   * @param {*} b
   */
  match (a, b) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
}
