const superAgent = require('superagent')
const config = require('./config')
module.exports = {
  async getList (options, page) {
    return new Promise((resolve, reject) => {
      superAgent.get('http://m.ziroom.com/v7/room/list.json')
        .query(Object.assign({
          page: 1,
          city_code: 110000
        }, options))
        .end((err, res) => {
          if (err) reject(err)
          resolve(JSON.parse(res.text))
        })
    })
  },
  loop () {
    return new Promise(async (resolve, reject) => {
      let result = []
      let filter = config.storageFilter
      let page = 1
      while (page <= config.maxPage) {
        let res = await this.getList(config.searchFilter, page)
        console.log(page, res.data)
        if (res.error_code === 0) {
          if (res.data.rooms.length === 0) {
            resolve(result)
          } else {
            page++
            console.log(new Date())
            await this.sleep(this.getDurationRandom(config.avgDuration))
            console.log(new Date())
          }
          result.concat(res.data.rooms.filter((item) => {
            return item.area >= filter.minArea &&
              item.price <= filter.maxPrice
          }))
        } else {
          console.log('get list error', res.error_message)
        }
      }
    })
  },
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
  }
}
