const Express = require('express')
const bodyParser = require('body-parser')
const db = require('./db')
const open = require('open')
const fs = require('fs')
const path = require('path')
let app = new Express()
app.use(bodyParser.json())
// 数据展示接口
app.use('/api/list', async (req, res) => {
  let list = await db.find({})
  let filter = req.query
  // 过滤
  let result = list.filter(function (item) {
    return Number(item.priceParsed.price) > Number(filter.price[0]) && Number(item.priceParsed.price) < Number(filter.price[1]);
  })
  result.forEach((item, idx, arr) => {
    // 骑行的时长和距离
    if (item.pathRide) {
      item.pathRide = {
        distance: item.pathRide.distance,
        duration: item.pathRide.duration
      }
    }
    // 公交时长和基本路线
    if (item.pathTransitGroup) {
      item.pathTransitGroup = item.pathTransitGroup.map((path) => {
        path.calcDuration = 0 // 多步的总和实际相加(一般会小于百度地图给出的总时长)
        path.steps = path.steps.map(ii => ii.map(iii => {
          path.calcDuration += iii.duration
          return {
            type: iii.vehicle_info.type, // 大类
            detailType: iii.vehicle_info.detail && iii.vehicle_info.detail.type, // 详细类型
            duration: iii.duration, // 本步用时
          }
        })[0]);
        return path
      })
    }
  })
  res.send(result)
})
// 数据展示首页
app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
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
    // open('http://localhost:8000')
  }
})

// 爬取
async function startSpider () {
  const search = require('./search')
  const config = require('./config')
  await search.loop(true, config.keywordsArray[0])
}
startSpider() // 开始爬取, 注释此行则启动服务, 不爬数据
