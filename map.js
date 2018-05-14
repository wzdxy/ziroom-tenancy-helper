const superAgent = require('superagent')
module.exports = {
  async getPath (origin, dest) {
    return new Promise((resolve, reject) => {
      superAgent.get('http://api.map.baidu.com/direction/v2/riding')
        .query({
          origin: origin,
          destination: dest,
          ak: 'HwAoQ1TvwIGh9Sxl9XxwGiThUWmktt2o'
        })
        .end((err, res) => {
          if (err) reject(err)
          resolve(res)
        })
    })
  }
}
