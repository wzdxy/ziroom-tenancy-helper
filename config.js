module.exports = {
  // 新氧 坐标
  origin: {
    x: 40.000865,
    y: 116.486121
  },
  originString: '40.000865,116.486121',
  keywordsArray: ['望京', '酒仙桥', '大山子', '太阳宫', '来广营', '三元桥'],
  searchFilter: {
    // 北京
    city_code: 110000,
    // 房屋类型
    type: 1,
    keywords: '望京'
  },
  storageFilter: {
    // 最小面积
    minArea: 10,
    // 最高价格
    maxPrice: 3500
  },
  // 搜索的平均频率
  avgDuration: 5000,
  // 搜索的最大页数
  maxPage: 100
}
