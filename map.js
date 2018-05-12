const superAgent = require('superagent')
module.exports = {
  async getPath (origin, dest) {
    return new Promise((resolve, reject) => {
      superAgent.get('http://api.map.baidu.com/direction/v2/riding')
        .query({
          origin: origin,
          destination: dest,
          ak: 'HSxj9DGfWYlFQvHocqxOmwjIHqQi0aGu'
        })
        .end((err, res) => {
          if (err) reject(err)
          resolve(res)
        })
    })
  }
}
