module.exports = {
  // 工作地点坐标 可在 http://api.map.baidu.com/lbsapi/getpoint/index.html 获取
  // 不过和这里的经纬度是相反的, 需自己调转一下 :)
  destinationString: '40.026884,116.474067',
  // 百度地图 api ak
  ak: '',
  // 所有要搜索的关键字
  keywordsArray: ['14号线','望京西','望京西','崔各庄','关庄','马泉营','太阳宫','大山子','亚运村','酒仙桥','三元桥','北苑'],
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
