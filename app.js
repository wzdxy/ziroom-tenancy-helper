const Express = require('express')
const bodyParser = require('body-parser')
const db = require('./db')
let app = new Express()
app.use(bodyParser.json())
app.use('/api/list', async (req, res) => {
  let list = await db.find({})
  let filter = req.query
  let result = list.filter(function (item) {
    if (!item.path.result) return true
    let distance = item.path.result.routes[0].distance / 1000
    return item.price > filter.price[0] && item.price < filter.price[1] &&
      distance > filter.distance[0] && distance < filter.distance[1]
  })
  res.send(result)
})
app.use('/', (req, res) => {
  res.sendfile('index.html')
})
app.listen(8000, (e) => {
  console.log(e)
})

async function getRooms () {
  const search = require('./search')
  let data = await search.loop(false)
  console.log(data)
}
getRooms()
