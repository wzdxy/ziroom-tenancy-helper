const superAgent = require('superagent')
const fs = require('fs')
const cheerio = require('cheerio')
const Express = require('express')
let app = new Express()
app.use('/', (req, res) => {
  res.sendfile('index.html')
})
app.listen(8000, (e) => {
  console.log(e)
})
let rooms = JSON.parse(fs.readFileSync('room.json', 'utf-8')).rooms
const result = {
  code: 0
}
let i = 0
console.log(rooms)
spider(rooms)

/**
 * 读取配置信息, 修改 rooms
 */
function getConfig () {
  rooms = JSON.parse(fs.readFileSync('room.json', 'utf-8')).rooms
}

/**
 * 启动爬虫
 */
function spider () {
  setTimeout(() => {
    if (i === rooms.length) {
      getConfig()
      i = 0
      getRoom(rooms[i++])
    } else {
      getRoom(rooms[i++])
    }
  }, 5000)
}

/**
 * 获取一个 room 的 html 并解析
 * @param {String} url
 */
function getRoom (url) {
  // let reg = /\d*/.(url)
  // let a = url.search(/[0-9]+/)
  superAgent
    .get(url)
    // .get('m.ziroom.com/BJ/room/60205027.html')
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
