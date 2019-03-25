module.exports = {
  // 工作地点坐标 可在 http://api.map.baidu.com/lbsapi/getpoint/index.html 获取
  origin: {
    x: 40.025434,
    y: 116.47314
  },
  originString: '40.000865,116.486121',
  // 百度地图 api ak
  ak: '',
  // 所有要搜索的关键字
  keywordsArray: ['望京', '太阳宫', '来广营', '亚运村小营', '北苑'],
  // 搜索条件
  searchFilter: {
    // 城市代码 默认北京
    city_code: 110000,
    // 房屋类型 1-友家  12-整租2居
    type: '12'
  },
  // 搜索的平均频率 (ms)
  avgDuration: 5000,
  // 搜索的最大页数
  maxPage: 100
}
