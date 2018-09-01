const Express = require('express')
const bodyParser = require('body-parser')
const db = require('./db')
const open = require('open')
const fs = require('fs')
let app = new Express()
app.use(bodyParser.json())
// 数据展示接口
app.use('/api/list', async (req, res) => {
  let list = await db.find({})
  let filter = req.query
  let result = list.filter(function (item) {
    if (!item.path.result) return true
    let distance = item.path.result.routes[0].distance / 1000
    return item.priceParsed.price > filter.price[0] && item.priceParsed.price < filter.price[1] && distance > filter.distance[0] && distance < filter.distance[1]
  })
  res.send(result)
})
// 数据展示首页
app.use('/', (req, res) => {
  res.sendfile('index.html')
})

// 判断 traineddata 训练数据, 用于 tesseract.js 识别
if (!fs.existsSync('eng.traineddata')) {
  console.error('tesseract.js 需要训练数据\n手动下载: https://github.com/naptha/tessdata/blob/gh-pages/3.02/eng.traineddata.gz 并解压为 eng.traineddata')
  console.log('或者: wget https://github.com/naptha/tessdata/raw/gh-pages/3.02/eng.traineddata.gz && gunzip eng.traineddata.gz')
  process.exit()
}

// 启动服务
app.listen(8000, (e) => {
  if (e) {
    console.log(e)
  } else {
    open('http://localhost:8000')
  }
})

// 爬取
async function startSpider () {
  const search = require('./search')
  const config = require('./config')
  await search.loop(true, config.keywordsArray[0])
}
startSpider() // 开始爬取, 注释此行则启动服务, 不爬数据
