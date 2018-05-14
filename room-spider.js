const superAgent = require('superagent')
const fs = require('fs')
const cheerio = require('cheerio')

let rooms = JSON.parse(fs.readFileSync('room.json', 'utf-8')).rooms

/**
 * 获取一个 room 的 html 并解析
 * @param {String} url
 */
function getRoom (url) {
  superAgent
    .get(url)
    .end((err, res) => {
      spider()
      if (err) {
        console.log(err)
      } else {
        let $ = cheerio.load(res.text)
        let info = {
          url: url,
          name: $('.detail_txt h2').remove('.i').text() || $('.S_houseName p').text(),
          price: $('.detail_txt .price').text() || $('.S_changePrice').text(),
          status: (function () {
            if ($('.toTel').text() === '已出租') {
              return '已出租'
            } else if ($("img[onerror=\"this.src='/img/pzz_big.jpg'\"]").length > 0) {
              return '配置中'
            } else if ($('.S_contactBtn').text() === '联系Ta') {
              return '转租中'
            } else if ($('.toTel').text() === '联系管家') {
              return '可签约'
            } else {
              return ''
            }
          })()
        }
        console.log(info)
      }
    })
}
let i
/**
 * 启动爬虫
 */
function spider () {
  setTimeout(() => {
    if (i === rooms.length) {
      // getConfig()
      i = 0
      getRoom(rooms[i++])
    } else {
      getRoom(rooms[i++])
    }
  }, 5000)
}
