/**
 * 从图片和位置信息读取房租价格
 */

const Nedb = require('nedb')
const priceCache = new Nedb({ filename: './price.db', autoload: true })
const Tesseract = require('tesseract.js')
const superAgent = require('superagent')
const fs = require('fs')

/**
 * 根据 static 图片 url 和位移数据读取价格信息
 * @param {*} imgUrl
 * @param {*} positionArray
 */
async function parsePrice (imgUrl, positionArray) {
  return new Promise(async (resolve, reject) => {
    const imgId = imgUrl.split('/')[7].split('.')[0]
    let filePath = 'assets/price-img/' + imgId + '.png'
    // 尝试在数据库中查找是不是以前识别过的图
    const cache = await getCachePrice(imgId)
    if (cache && cache.length > 0) {
      // 如果命中缓存直接计算价格并返回
      // console.log('命中 OCR 缓存', imgId)
      cache[0].price = pic2price(cache[0].numbers, positionArray)
      resolve(cache[0])
    } else {
      // 如果没有缓存则寻找本地图片
      let error
      if (fs.existsSync(filePath)) {
        // 本地有图片就识别
        // 调用 OCR 识别10个数字
        const numbers = await parseNumber(filePath)
        const price = pic2price(numbers, positionArray)
        const result = {
          id: imgId,
          numbers: numbers, // 10个数字序列
          localPath: filePath,
          imgUrl: imgUrl,
          raw: [imgUrl, positionArray]
        }
        // 识别结果, 图片路径等都保存到数据库作为缓存
        await createCachePrice(result)
        result.price = price
        resolve(result)
      } else {
        // 本地没有就先下载图片再识别
        superAgent.get('http:' + imgUrl).end(async (err, res) => {
          if (err) {
            reject(err)
          }
          // 保存图片到本地
          if (!fs.existsSync(filePath)) {
            error = fs.writeFileSync(filePath, res.body)
            console.log('下载图片', imgId)
          }
          if (error) {
            console.log('写入文件 Error', error)
            reject(error)
          } else {
            // 调用 OCR 识别10个数字
            const numbers = await parseNumber(filePath)
            const price = pic2price(numbers, positionArray)
            const result = {
              id: imgId,
              numbers: numbers, // 10个数字序列
              localPath: filePath,
              imgUrl: imgUrl,
              raw: [imgUrl, positionArray]
            }
            // 识别结果, 图片路径等都保存到数据库作为缓存
            await createCachePrice(result)
            result.price = price
            resolve(result)
          }
        })
      }
    }
  })
  function pic2price (numbers, positionArray) {
    return positionArray.map((i) => numbers[i]).join('')
  }
}

async function parseNumber (imagePath) {
  return new Promise((resolve, reject) => {
    console.log('启动 OCR', imagePath)
    try {
      Tesseract.create({ langPath: 'eng.traineddata' }).recognize(imagePath, 'eng').then(function (result) {
        if (result && result.text) {
          resolve(result.text.replace(/\n/g, ''))
        } else {
          reject(new Error('Tesseract run failed'))
        }
      }).catch((err) => {
        throw err
      })
    } catch (error) {
      console.error(error)
    }
  })
}

/**
 * 尝试从数据库中取出以前识别过的图片
 * @param {String} id 图片ID
 */
async function getCachePrice (id) {
  return new Promise((resolve, reject) => {
    priceCache.find({
      id: id
    }, (err, ret) => {
      if (!err) {
        resolve(ret)
      }
    })
  })
}

/**
 * 将识别结果存到数据库
 * @param {Object} data 识别结果
 */
async function createCachePrice (data) {
  return new Promise((resolve, reject) => {
    priceCache.insert(data, (err, ret) => {
      if (!err) {
        resolve()
      }
    })
  })
}

// (async function run () {
//   console.log(await parsePrice('//static8.ziroom.com/phoenix/pc/images/price/0fcc0d83409c547d3a9d038cc7808fa3s.png', [5, 4, 3, 8]))
// })()

module.exports = {
  parsePrice: parsePrice
}
